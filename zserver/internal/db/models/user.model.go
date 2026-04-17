package models

// User represents a user in the system
type User struct {
	ID       string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Email    string `gorm:"uniqueIndex;type:varchar(255)" json:"email"`
	Password string `gorm:"type:varchar(255)" json:"-"`
	Role     string `gorm:"type:varchar(50);default:'customer'" json:"role"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

// TableName specifies the table name for the User model
func (User) TableName() string {
	return "users"
}

// UserDTO is the data transfer object for user responses
type UserDTO struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	IsActive bool   `json:"is_active"`
}

// ToDTO converts a User model to UserDTO
func (u *User) ToDTO() UserDTO {
	return UserDTO{
		ID:       u.ID,
		Email:    u.Email,
		Role:     u.Role,
		IsActive: u.IsActive,
	}
}
