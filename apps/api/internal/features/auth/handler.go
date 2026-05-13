package auth

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /v1/auth/me", h.currentUser)
	mux.HandleFunc("PATCH /v1/auth/profile", h.updateProfile)
	mux.HandleFunc("POST /v1/auth/password", h.updatePassword)
}

func (h *Handler) currentUser(w http.ResponseWriter, r *http.Request) {
	sessionUser, err := h.service.AuthenticateRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return
	}

	user, err := h.service.CurrentUser(r.Context(), sessionUser.ID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (h *Handler) updateProfile(w http.ResponseWriter, r *http.Request) {
	sessionUser, err := h.service.AuthenticateRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return
	}

	var request UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid profile payload")
		return
	}

	user, err := h.service.UpdateProfile(r.Context(), sessionUser, request)
	if err != nil {
		writeError(w, http.StatusBadRequest, "PROFILE_UPDATE_FAILED", "profile update failed")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (h *Handler) updatePassword(w http.ResponseWriter, r *http.Request) {
	sessionUser, err := h.service.AuthenticateRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return
	}

	var request UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid password payload")
		return
	}

	if err := h.service.UpdatePassword(r.Context(), sessionUser, request); err != nil {
		writeError(w, http.StatusBadRequest, "PASSWORD_UPDATE_FAILED", "password update failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, map[string]any{
		"success": false,
		"error": map[string]string{
			"code":    code,
			"message": message,
		},
	})
}
