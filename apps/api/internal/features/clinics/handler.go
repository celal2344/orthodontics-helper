package clinics

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
	mux.HandleFunc("GET /v1/clinics/current", h.currentClinic)
}

func (h *Handler) currentClinic(w http.ResponseWriter, r *http.Request) {
	user, err := h.authService.AuthenticateRequest(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"success": false})
		return
	}

	clinic, err := h.service.CurrentClinic(r.Context(), user.ClinicID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"success": false})
		return
	}

	writeJSON(w, http.StatusOK, clinic)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
