package patients

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
	mux.HandleFunc("GET /v1/patients", h.list)
	mux.HandleFunc("POST /v1/patients", h.create)
	mux.HandleFunc("DELETE /v1/patients/{id}", h.softDelete)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	patients, err := h.service.List(r.Context(), clinicIDFromRequest(r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PATIENT_LIST_FAILED", "list patients failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": patients})
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var request CreatePatientRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid patient payload")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"data": request})
}

func (h *Handler) softDelete(w http.ResponseWriter, r *http.Request) {
	if err := h.service.SoftDelete(r.Context(), clinicIDFromRequest(r), r.PathValue("id")); err != nil {
		writeError(w, http.StatusInternalServerError, "PATIENT_DELETE_FAILED", "delete patient failed")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func clinicIDFromRequest(_ *http.Request) string {
	return "clinic_demo"
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
