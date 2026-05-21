package models

import "time"

type User struct {
	ID               string    `json:"id" db:"id"`
	Email            string    `json:"email" db:"email"`
	PasswordHash     string    `json:"-" db:"password_hash"`
	DisplayName      string    `json:"display_name" db:"display_name"`
	SubscriptionTier string    `json:"subscription_tier" db:"subscription_tier"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

type RegisterRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	DisplayName string `json:"display_name" binding:"required,min=2"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         *User  `json:"user"`
}
