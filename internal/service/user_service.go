package service

import (
	"context"

	"backend-service/internal/domain"
	"backend-service/internal/repository"
)

type UserService struct {
	repo     *repository.UserRepository
	newsRepo *repository.NewsRepository
}

func NewUserService(repos *repository.Repositories) *UserService {
	return &UserService{repo: repos.Users, newsRepo: repos.News}
}

func (s *UserService) List(ctx context.Context) ([]domain.User, error) {
	return s.repo.List(ctx)
}

func (s *UserService) GetByID(ctx context.Context, id int64) (domain.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *UserService) Me(ctx context.Context, id int64) (domain.User, error) {
	return s.repo.GetWithLastLesson(ctx, id)
}

func (s *UserService) NewsActivity(ctx context.Context, id int64) (domain.UserNewsActivity, error) {
	return s.newsRepo.UserActivity(ctx, id)
}
