package app

import "net/http"

func RegisterRoutes(mux *http.ServeMux, deps *Dependencies) {
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	deps.AuthHandler.RegisterRoutes(mux)
	deps.ClinicHandler.RegisterRoutes(mux)
	deps.UserHandler.RegisterRoutes(mux)
	deps.PatientHandler.RegisterRoutes(mux)
	deps.AppointmentHandler.RegisterRoutes(mux)
	deps.SMSHandler.RegisterRoutes(mux)
	deps.AuditHandler.RegisterRoutes(mux)
}
