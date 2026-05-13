package patients

import (
	"encoding/json"
	"errors"
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
	mux.HandleFunc("GET /v1/patients", h.list)
	mux.HandleFunc("POST /v1/patients", h.create)
	mux.HandleFunc("GET /v1/patients/{id}", h.get)
	mux.HandleFunc("PATCH /v1/patients/{id}", h.update)
	mux.HandleFunc("DELETE /v1/patients/{id}", h.softDelete)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	patients, err := h.service.List(r.Context(), user.ClinicID, r.URL.Query().Get("q"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PATIENT_LIST_FAILED", "list patients failed")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": patients})
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	patient, err := h.service.Get(r.Context(), user.ClinicID, r.PathValue("id"))
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			writeError(w, http.StatusNotFound, "PATIENT_NOT_FOUND", "patient not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "PATIENT_GET_FAILED", "get patient failed")
		return
	}

	writeJSON(w, http.StatusOK, patient)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	var request CreatePatientRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid patient payload")
		return
	}

	patient, err := h.service.Create(r.Context(), user, request)
	if err != nil {
		if errors.Is(err, ErrInvalidInput) {
			writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid patient payload")
			return
		}
		writeError(w, http.StatusInternalServerError, "PATIENT_CREATE_FAILED", "create patient failed")
		return
	}

	writeJSON(w, http.StatusCreated, patient)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	var request UpdatePatientRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid patient payload")
		return
	}

	patient, err := h.service.Update(r.Context(), user, r.PathValue("id"), request)
	if err != nil {
		if errors.Is(err, ErrInvalidInput) {
			writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "invalid patient payload")
			return
		}
		if errors.Is(err, ErrNotFound) {
			writeError(w, http.StatusNotFound, "PATIENT_NOT_FOUND", "patient not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "PATIENT_UPDATE_FAILED", "update patient failed")
		return
	}

	writeJSON(w, http.StatusOK, patient)
}

func (h *Handler) softDelete(w http.ResponseWriter, r *http.Request) {
	user, ok := h.authenticate(w, r)
	if !ok {
		return
	}

	if err := h.service.SoftDelete(r.Context(), user, r.PathValue("id")); err != nil {
		if errors.Is(err, ErrNotFound) {
			writeError(w, http.StatusNotFound, "PATIENT_NOT_FOUND", "patient not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "PATIENT_DELETE_FAILED", "delete patient failed")
		return
	}

	w.WriteHeader(http.StatusNoContent)
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
