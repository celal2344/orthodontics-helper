package audit

import "time"

type Log struct {
	ID          string
	ClinicID    string
	ActorUserID string
	EntityType  string
	EntityID    string
	Action      string
	Summary     string
	Before      []byte
	After       []byte
	IPAddress   string
	UserAgent   string
	CreatedAt   time.Time
}
