package app

import (
	"encoding/json"
	"net/http"
	"time"
)

func NewServer(deps *Dependencies) *http.Server {
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps)

	return &http.Server{
		Addr:              deps.Config.HTTPAddr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
