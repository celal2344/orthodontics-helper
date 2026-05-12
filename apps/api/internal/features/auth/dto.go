package auth

type CurrentUserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"fullName"`
	ClinicID string `json:"clinicId"`
}
