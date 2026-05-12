package audit

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
	mux.HandleFunc("GET /v1/audit-logs", h.list)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	entityType := r.URL.Query().Get("entityType")
	entityID := r.URL.Query().Get("entityId")

	logs, err := h.service.ListForEntity(r.Context(), entityType, entityID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"success": false})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": logs})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
