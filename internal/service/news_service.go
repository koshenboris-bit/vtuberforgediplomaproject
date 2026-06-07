package service

import (
	"context"
	"strings"

	"backend-service/internal/domain"
	"backend-service/internal/repository"
)

type NewsService struct {
	repo *repository.NewsRepository
}

func NewNewsService(repos *repository.Repositories) *NewsService {
	return &NewsService{repo: repos.News}
}

func (s *NewsService) Create(ctx context.Context, req domain.NewsRequest) (domain.News, error) {
	if req.Title == "" || req.Content == "" {
		return domain.News{}, domain.ErrValidation
	}
	if s.needsNewsTranslation(domain.News{Title: req.Title, Content: req.Content, Translations: req.Translations}) {
		req.Translations = s.translateNews(ctx, req.Title, req.Content)
	}
	return s.repo.Create(ctx, domain.News{Title: req.Title, Content: req.Content, Translations: req.Translations})
}

func (s *NewsService) translateNews(ctx context.Context, title, content string) domain.NewsTranslations {
	sourceLang := detectContentLanguage(title, content)
	out := domain.NewsTranslations{}

	for _, lang := range contentLanguages {
		out[lang] = domain.NewsTranslation{
			Title:   translateContent(ctx, title, sourceLang, lang),
			Content: translateContent(ctx, content, sourceLang, lang),
		}
	}

	return out
}

func (s *NewsService) needsNewsTranslation(item domain.News) bool {
	sourceLang := detectContentLanguage(item.Title, item.Content)
	if len(item.Translations) == 0 {
		return true
	}

	for _, lang := range contentLanguages {
		current, ok := item.Translations[lang]
		if !ok || current.Title == "" || current.Content == "" {
			return true
		}
		if lang != sourceLang && current.Title == item.Title && current.Content == item.Content {
			return true
		}
	}

	return false
}

func (s *NewsService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}

func (s *NewsService) List(ctx context.Context, userID int64) ([]domain.News, error) {
	items, err := s.repo.List(ctx, userID)
	if err != nil {
		return nil, err
	}

	for i := range items {
		if !s.needsNewsTranslation(items[i]) {
			continue
		}

		items[i].Translations = s.translateNews(ctx, items[i].Title, items[i].Content)
		if err := s.repo.UpdateTranslations(ctx, items[i].ID, items[i].Translations); err != nil {
			return nil, err
		}
	}

	return items, nil
}

func (s *NewsService) ToggleLike(ctx context.Context, userID, newsID int64) (domain.NewsReactionResponse, error) {
	if userID <= 0 || newsID <= 0 {
		return domain.NewsReactionResponse{}, domain.ErrValidation
	}
	return s.repo.ToggleLike(ctx, userID, newsID)
}

func (s *NewsService) ToggleSave(ctx context.Context, userID, newsID int64) (domain.NewsReactionResponse, error) {
	if userID <= 0 || newsID <= 0 {
		return domain.NewsReactionResponse{}, domain.ErrValidation
	}
	return s.repo.ToggleSave(ctx, userID, newsID)
}

func (s *NewsService) AddComment(ctx context.Context, userID, newsID int64, req domain.NewsCommentRequest) (domain.NewsComment, error) {
	content := strings.TrimSpace(req.Content)
	if userID <= 0 || newsID <= 0 || content == "" || len(content) > 1200 {
		return domain.NewsComment{}, domain.ErrValidation
	}
	return s.repo.AddComment(ctx, userID, newsID, content)
}

func (s *NewsService) UserActivity(ctx context.Context, userID int64) (domain.UserNewsActivity, error) {
	if userID <= 0 {
		return domain.UserNewsActivity{}, domain.ErrValidation
	}
	return s.repo.UserActivity(ctx, userID)
}
