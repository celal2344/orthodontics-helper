package auth

type CurrentUserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"fullName"`
	ClinicID string `json:"clinicId"`
}

type UpdateProfileRequest struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
}

type UpdatePasswordRequest struct {
	Password string `json:"password"`
}
