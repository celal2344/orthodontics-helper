package users

type ColleagueResponse struct {
	ID       string `json:"id"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Clinic   string `json:"clinic"`
	JoinedAt string `json:"joinedAt"`
}

type CreateClinicMemberRequest struct {
	FullName          string `json:"fullName"`
	Email             string `json:"email"`
	TemporaryPassword string `json:"temporaryPassword"`
}
