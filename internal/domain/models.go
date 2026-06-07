package domain

import "time"

type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

type LessonType string

const (
	LessonIntro LessonType = "intro"
	LessonFull  LessonType = "full"
)

type User struct {
	ID         int64     `json:"id"`
	Login      string    `json:"login"`
	Password   string    `json:"-"`
	Role       Role      `json:"role"`
	CreatedAt  time.Time `json:"createdAt"`
	LastLesson *Lesson   `json:"lastLesson,omitempty"`
}

type Lesson struct {
	ID           int64              `json:"id"`
	Title        string             `json:"title"`
	Description  string             `json:"description"`
	LessonType   LessonType        `json:"lessonType"`
	VideoLink    string             `json:"videoLink"`
	CreatedAt    time.Time          `json:"createdAt"`
	Passed       bool               `json:"passed"`
	Translations LessonTranslations `json:"translations,omitempty"`
}

type News struct {
	ID           int64             `json:"id"`
	Title        string            `json:"title"`
	Content      string            `json:"content"`
	CreatedAt    time.Time         `json:"createdAt"`
	Translations NewsTranslations  `json:"translations,omitempty"`
	LikeCount    int64             `json:"likeCount"`
	SaveCount    int64             `json:"saveCount"`
	CommentCount int64             `json:"commentCount"`
	LikedByMe    bool              `json:"likedByMe"`
	SavedByMe    bool              `json:"savedByMe"`
	Comments     []NewsComment     `json:"comments,omitempty"`
}

type NewsComment struct {
	ID        int64     `json:"id"`
	NewsID    int64     `json:"newsId"`
	NewsTitle string    `json:"newsTitle,omitempty"`
	UserID    int64     `json:"userId"`
	UserLogin string    `json:"userLogin"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type NewsReactionResponse struct {
	Active bool  `json:"active"`
	Count  int64 `json:"count"`
}

type UserNewsActivity struct {
	LikedNews    []News        `json:"likedNews"`
	SavedNews    []News        `json:"savedNews"`
	Comments     []NewsComment `json:"comments"`
	LikedCount   int64         `json:"likedCount"`
	SavedCount   int64         `json:"savedCount"`
	CommentCount int64         `json:"commentCount"`
}

type LessonTranslation struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
}

type LessonTranslations map[string]LessonTranslation

type NewsTranslation struct {
	Title   string `json:"title,omitempty"`
	Content string `json:"content,omitempty"`
}

type NewsTranslations map[string]NewsTranslation

type UserLesson struct {
	UserID    int64     `json:"userId"`
	LessonID  int64     `json:"lessonId"`
	CreatedAt time.Time `json:"createdAt"`
}

type RegisterRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type AuthResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	User         User   `json:"user"`
}

type NewsRequest struct {
	Title        string           `json:"title"`
	Content      string           `json:"content"`
	Translations NewsTranslations `json:"translations,omitempty"`
}

type NewsCommentRequest struct {
	Content string `json:"content"`
}

type LessonRequest struct {
	Title        string             `json:"title"`
	Description  string             `json:"description"`
	LessonType   LessonType         `json:"lessonType"`
	VideoLink    string             `json:"videoLink"`
	Translations LessonTranslations `json:"translations,omitempty"`
}

type PassLessonRequest struct {
	UserID int64 `json:"userId"`
}

type MeResponse struct {
	User User `json:"user"`
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}
