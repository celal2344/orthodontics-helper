package auth

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Service struct {
	repository             *Repository
	tokenVerifier          TokenVerifierConfig
	supabaseURL            string
	supabaseServiceRoleKey string
	jwksCache              *jwksCache
}

type TokenVerifierConfig struct {
	JWTSecret  string
	JWKSURL    string
	Issuer     string
	Audience   string
	Algorithms []string
}

type jwksCache struct {
	mu        sync.Mutex
	keys      map[string]any
	expiresAt time.Time
}

type jwksDocument struct {
	Keys []jwk `json:"keys"`
}

type jwk struct {
	KeyID     string `json:"kid"`
	KeyType   string `json:"kty"`
	Algorithm string `json:"alg"`
	Curve     string `json:"crv"`
	Use       string `json:"use"`
	N         string `json:"n"`
	E         string `json:"e"`
	X         string `json:"x"`
	Y         string `json:"y"`
}

func NewService(repository *Repository, tokenVerifier TokenVerifierConfig, supabaseURL string, supabaseServiceRoleKey string) *Service {
	return &Service{
		repository:             repository,
		tokenVerifier:          tokenVerifier,
		supabaseURL:            strings.TrimRight(supabaseURL, "/"),
		supabaseServiceRoleKey: supabaseServiceRoleKey,
		jwksCache:              &jwksCache{},
	}
}

func (s *Service) CurrentUser(ctx context.Context, userID string) (*CurrentUserResponse, error) {
	user, err := s.repository.FindSessionUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &CurrentUserResponse{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		ClinicID: user.ClinicID,
	}, nil
}

func (s *Service) AuthenticateRequest(r *http.Request) (*SessionUser, error) {
	token := bearerToken(r)
	if token == "" {
		return nil, ErrUnauthorized
	}

	userID, err := s.verifyToken(token)
	if err != nil {
		return nil, err
	}

	return s.repository.FindSessionUser(r.Context(), userID)
}

func (s *Service) UpdateProfile(ctx context.Context, user *SessionUser, input UpdateProfileRequest) (*CurrentUserResponse, error) {
	fullName := strings.TrimSpace(input.FullName)
	email := strings.TrimSpace(input.Email)
	if fullName == "" || email == "" {
		return nil, ErrUnauthorized
	}

	if err := s.updateSupabaseUser(ctx, user.ID, map[string]any{
		"email": email,
		"user_metadata": map[string]any{
			"full_name": fullName,
		},
	}); err != nil {
		return nil, err
	}

	updatedUser, err := s.repository.UpdateUser(ctx, user.ID, fullName, email)
	if err != nil {
		return nil, err
	}

	return &CurrentUserResponse{
		ID:       updatedUser.ID,
		Email:    updatedUser.Email,
		FullName: updatedUser.FullName,
		ClinicID: updatedUser.ClinicID,
	}, nil
}

func (s *Service) UpdatePassword(ctx context.Context, user *SessionUser, input UpdatePasswordRequest) error {
	if len(input.Password) < 8 {
		return ErrUnauthorized
	}

	return s.updateSupabaseUser(ctx, user.ID, map[string]any{
		"password": input.Password,
	})
}

func (s *Service) verifyToken(tokenString string) (string, error) {
	if s.tokenVerifier.JWKSURL == "" && s.tokenVerifier.JWTSecret == "" {
		return "", ErrUnauthorized
	}

	parserOptions := []jwt.ParserOption{}
	if len(s.tokenVerifier.Algorithms) > 0 {
		parserOptions = append(parserOptions, jwt.WithValidMethods(s.tokenVerifier.Algorithms))
	}
	if s.tokenVerifier.Issuer != "" {
		parserOptions = append(parserOptions, jwt.WithIssuer(s.tokenVerifier.Issuer))
	}
	if s.tokenVerifier.Audience != "" {
		parserOptions = append(parserOptions, jwt.WithAudience(s.tokenVerifier.Audience))
	}

	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, s.keyfunc, parserOptions...)
	if err != nil || !token.Valid {
		return "", ErrUnauthorized
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", ErrUnauthorized
	}

	sub, err := claims.GetSubject()
	if err != nil || sub == "" {
		return "", ErrUnauthorized
	}

	return sub, nil
}

func (s *Service) keyfunc(token *jwt.Token) (any, error) {
	if s.tokenVerifier.JWKSURL != "" {
		keyID, _ := token.Header["kid"].(string)
		if keyID == "" {
			return nil, ErrUnauthorized
		}

		keys, err := s.cachedJWKSKeys()
		if err != nil {
			return nil, err
		}

		key, ok := keys[keyID]
		if !ok {
			s.expireJWKS()
			keys, err = s.cachedJWKSKeys()
			if err != nil {
				return nil, err
			}
			key, ok = keys[keyID]
			if !ok {
				return nil, ErrUnauthorized
			}
		}

		return key, nil
	}

	if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
		return nil, ErrUnauthorized
	}
	return []byte(s.tokenVerifier.JWTSecret), nil
}

func (s *Service) cachedJWKSKeys() (map[string]any, error) {
	s.jwksCache.mu.Lock()
	defer s.jwksCache.mu.Unlock()

	if len(s.jwksCache.keys) > 0 && time.Now().Before(s.jwksCache.expiresAt) {
		return s.jwksCache.keys, nil
	}

	request, err := http.NewRequest(http.MethodGet, s.tokenVerifier.JWKSURL, nil)
	if err != nil {
		return nil, err
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("fetch jwks: %s", response.Status)
	}

	var document jwksDocument
	if err := json.NewDecoder(response.Body).Decode(&document); err != nil {
		return nil, err
	}

	keys := make(map[string]any, len(document.Keys))
	for _, key := range document.Keys {
		publicKey, err := key.publicKey()
		if err != nil {
			return nil, err
		}
		keys[key.KeyID] = publicKey
	}

	s.jwksCache.keys = keys
	s.jwksCache.expiresAt = time.Now().Add(10 * time.Minute)
	return keys, nil
}

func (s *Service) expireJWKS() {
	s.jwksCache.mu.Lock()
	defer s.jwksCache.mu.Unlock()
	s.jwksCache.expiresAt = time.Time{}
}

func (key jwk) publicKey() (any, error) {
	switch key.KeyType {
	case "RSA":
		return key.rsaPublicKey()
	case "EC":
		return key.ecdsaPublicKey()
	default:
		return nil, fmt.Errorf("unsupported jwk key type: %s", key.KeyType)
	}
}

func (key jwk) rsaPublicKey() (*rsa.PublicKey, error) {
	modulusBytes, err := decodeBase64URLUInt(key.N)
	if err != nil {
		return nil, err
	}
	exponentBytes, err := decodeBase64URLUInt(key.E)
	if err != nil {
		return nil, err
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(modulusBytes),
		E: int(new(big.Int).SetBytes(exponentBytes).Int64()),
	}, nil
}

func (key jwk) ecdsaPublicKey() (*ecdsa.PublicKey, error) {
	if key.Curve != "P-256" {
		return nil, fmt.Errorf("unsupported jwk curve: %s", key.Curve)
	}

	xBytes, err := decodeBase64URLUInt(key.X)
	if err != nil {
		return nil, err
	}
	yBytes, err := decodeBase64URLUInt(key.Y)
	if err != nil {
		return nil, err
	}

	return &ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X:     new(big.Int).SetBytes(xBytes),
		Y:     new(big.Int).SetBytes(yBytes),
	}, nil
}

func decodeBase64URLUInt(value string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(value)
}

func (s *Service) updateSupabaseUser(ctx context.Context, userID string, payload map[string]any) error {
	if s.supabaseURL == "" || s.supabaseServiceRoleKey == "" {
		return fmt.Errorf("supabase admin config is required")
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/auth/v1/admin/users/%s", s.supabaseURL, userID), bytes.NewReader(body))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("apikey", s.supabaseServiceRoleKey)
	request.Header.Set("Authorization", "Bearer "+s.supabaseServiceRoleKey)

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("supabase admin update user failed: %s", response.Status)
	}

	return nil
}

func bearerToken(r *http.Request) string {
	value := r.Header.Get("Authorization")
	if value == "" {
		return ""
	}

	token, ok := strings.CutPrefix(value, "Bearer ")
	if !ok {
		return ""
	}

	return strings.TrimSpace(token)
}
