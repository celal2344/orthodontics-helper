package sms

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
	mux.HandleFunc("GET /v1/sms/templates", h.listTemplates)
	mux.HandleFunc("POST /v1/sms/send", h.sendManual)
}

func (h *Handler) listTemplates(w http.ResponseWriter, r *http.Request) {
	templates, err := h.service.ListTemplates(r.Context(), "clinic_demo")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "SMS_TEMPLATE_LIST_FAILED", "list sms templates failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": templates})
}

func (h *Handler) sendManual(w http.ResponseWriter, r *http.Request) {
	var request SendManualSMSRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid sms payload")
		return
	}

	response, err := h.service.SendManual(r.Context(), request)
	if err != nil {
		writeError(w, http.StatusBadGateway, "SMS_SEND_FAILED", "sms send failed")
		return
	}

	writeJSON(w, http.StatusCreated, response)
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
