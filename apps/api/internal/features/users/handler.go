package users

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
	mux.HandleFunc("GET /v1/colleagues", h.listColleagues)
	mux.HandleFunc("POST /v1/clinic-members", h.createClinicMember)
}

func (h *Handler) listColleagues(w http.ResponseWriter, r *http.Request) {
	user, err := h.authService.AuthenticateRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return
	}

	colleagues, err := h.service.ListColleagues(r.Context(), user.ClinicID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "COLLEAGUE_LIST_FAILED", "list colleagues failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": colleagues})
}

func (h *Handler) createClinicMember(w http.ResponseWriter, r *http.Request) {
	user, err := h.authService.AuthenticateRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "current user is unavailable")
		return
	}

	var request CreateClinicMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid clinic member payload")
		return
	}

	colleague, err := h.service.CreateClinicMember(r.Context(), user.ClinicID, request)
	if err != nil {
		writeError(w, http.StatusBadRequest, "CLINIC_MEMBER_CREATE_FAILED", "create clinic member failed")
		return
	}

	writeJSON(w, http.StatusCreated, colleague)
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
