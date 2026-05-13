package audit

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
	mux.HandleFunc("GET /v1/audit-logs", h.list)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	entityType := r.URL.Query().Get("entityType")
	entityID := r.URL.Query().Get("entityId")

	logs, err := h.service.ListForEntity(r.Context(), user.ClinicID, entityType, entityID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"success": false})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": logs})
}

func (h *Handler) authenticate(w http.ResponseWriter, r *http.Request) (*auth.SessionUser, bool) {
	user, err := h.authService.AuthenticateRequest(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"success": false})
		return nil, false
	}

	return user, true
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
