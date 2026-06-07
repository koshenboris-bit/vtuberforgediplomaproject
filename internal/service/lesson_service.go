package service

import (
	"context"

	"backend-service/internal/domain"
	"backend-service/internal/repository"
)

type LessonService struct {
	repo *repository.LessonRepository
	users *repository.UserRepository
}

func NewLessonService(repos *repository.Repositories) *LessonService {
	return &LessonService{repo: repos.Lessons, users: repos.Users}
}

func (s *LessonService) Create(ctx context.Context, req domain.LessonRequest) (domain.Lesson, error) {
	if req.Title == "" || req.Description == "" || req.VideoLink == "" || req.LessonType == "" {
		return domain.Lesson{}, domain.ErrValidation
	}
	if req.LessonType != domain.LessonIntro && req.LessonType != domain.LessonFull {
		return domain.Lesson{}, domain.ErrValidation
	}
	if s.needsLessonTranslation(domain.Lesson{Title: req.Title, Description: req.Description, Translations: req.Translations}) {
		req.Translations = s.translateLesson(ctx, req.Title, req.Description)
	}
	return s.repo.Create(ctx, domain.Lesson{
		Title: req.Title, Description: req.Description, LessonType: req.LessonType, VideoLink: req.VideoLink, Translations: req.Translations,
	})
}

func (s *LessonService) Update(ctx context.Context, id int64, req domain.LessonRequest) (domain.Lesson, error) {
	if req.Title == "" || req.Description == "" || req.VideoLink == "" || req.LessonType == "" {
		return domain.Lesson{}, domain.ErrValidation
	}
	if s.needsLessonTranslation(domain.Lesson{Title: req.Title, Description: req.Description, Translations: req.Translations}) {
		req.Translations = s.translateLesson(ctx, req.Title, req.Description)
	}
	return s.repo.Update(ctx, id, domain.Lesson{
		Title: req.Title, Description: req.Description, LessonType: req.LessonType, VideoLink: req.VideoLink, Translations: req.Translations,
	})
}

func (s *LessonService) translateLesson(ctx context.Context, title, description string) domain.LessonTranslations {
	sourceLang := detectContentLanguage(title, description)
	out := domain.LessonTranslations{}

	for _, lang := range contentLanguages {
		out[lang] = domain.LessonTranslation{
			Title:       translateContent(ctx, title, sourceLang, lang),
			Description: translateContent(ctx, description, sourceLang, lang),
		}
	}

	return out
}

func (s *LessonService) needsLessonTranslation(item domain.Lesson) bool {
	sourceLang := detectContentLanguage(item.Title, item.Description)
	if len(item.Translations) == 0 {
		return true
	}

	for _, lang := range contentLanguages {
		current, ok := item.Translations[lang]
		if !ok || current.Title == "" || current.Description == "" {
			return true
		}
		if lang != sourceLang && current.Title == item.Title && current.Description == item.Description {
			return true
		}
	}

	return false
}

func (s *LessonService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}

func (s *LessonService) List(ctx context.Context, userID int64) ([]domain.Lesson, error) {
	items, err := s.repo.List(ctx, userID)
	if err != nil {
		return nil, err
	}

	for i := range items {
		if !s.needsLessonTranslation(items[i]) {
			continue
		}

		items[i].Translations = s.translateLesson(ctx, items[i].Title, items[i].Description)
		if err := s.repo.UpdateTranslations(ctx, items[i].ID, items[i].Translations); err != nil {
			return nil, err
		}
	}

	return items, nil
}

func (s *LessonService) Pass(ctx context.Context, lessonID, userID int64, callerID int64, callerRole string) error {
	if callerRole != "admin" && callerID != userID {
		return domain.ErrForbidden
	}
	_, err := s.repo.GetByID(ctx, lessonID)
	if err != nil {
		return err
	}
	_, err = s.users.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	return s.repo.MarkPassed(ctx, userID, lessonID)
}
