package audit

type CreateLogInput struct {
	ClinicID    string
	ActorUserID string
	EntityType  string
	EntityID    string
	Action      string
	Summary     string
}

type LogResponse struct {
	ID        string `json:"id"`
	Action    string `json:"action"`
	Summary   string `json:"summary"`
	CreatedAt string `json:"createdAt"`
}
