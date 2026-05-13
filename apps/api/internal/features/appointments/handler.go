package appointments

import (
	"encoding/json"
	"net/http"

	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/auth"
)

type Handler struct {
	service     *Service
	authService *auth.Service
}

func NewHandler(service *Service, authService *auth.Service) *Handler {
	return &Handler{service: service, authService: authService}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /v1/appointments", h.list)
	mux.HandleFunc("POST /v1/appointments", h.create)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	appointments, err := h.service.List(r.Context(), user.ClinicID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "APPOINTMENT_LIST_FAILED", "list appointments failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": appointments})
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.authenticate(w, r); !ok {
		return
	}

	var request CreateAppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid appointment payload")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"data": request})
}

func (h *Handler) authenticate(w http.ResponseWriter, r *http.Request) (*auth.SessionUser, bool) {
	user, err := h.authService.AuthenticateRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return nil, false
	}

	return user, true
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
