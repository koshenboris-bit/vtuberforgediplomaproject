package repository

import (
	"context"
	"encoding/json"

	"backend-service/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type NewsRepository struct {
	db *pgxpool.Pool
}

func NewNewsRepository(db *pgxpool.Pool) *NewsRepository {
	return &NewsRepository{db: db}
}

func (r *NewsRepository) Create(ctx context.Context, item domain.News) (domain.News, error) {
	if item.Translations == nil {
		item.Translations = domain.NewsTranslations{}
	}
	translations, err := json.Marshal(item.Translations)
	if err != nil {
		return item, err
	}

	err = r.db.QueryRow(ctx, `
		INSERT INTO news (title, content, translations)
		VALUES ($1, $2, $3)
		RETURNING id, title, content, created_at, translations
	`, item.Title, item.Content, string(translations)).Scan(&item.ID, &item.Title, &item.Content, &item.CreatedAt, &translations)
	if err == nil {
		err = json.Unmarshal(translations, &item.Translations)
	}
	return item, err
}

func (r *NewsRepository) Delete(ctx context.Context, id int64) error {
	ct, err := r.db.Exec(ctx, `DELETE FROM news WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *NewsRepository) UpdateTranslations(ctx context.Context, id int64, translations domain.NewsTranslations) error {
	if translations == nil {
		translations = domain.NewsTranslations{}
	}
	payload, err := json.Marshal(translations)
	if err != nil {
		return err
	}

	ct, err := r.db.Exec(ctx, `UPDATE news SET translations = $1 WHERE id = $2`, string(payload), id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *NewsRepository) List(ctx context.Context, userID int64) ([]domain.News, error) {
	rows, err := r.db.Query(ctx, `
		SELECT n.id, n.title, n.content, n.created_at, n.translations,
		       (SELECT COUNT(*) FROM news_likes nl WHERE nl.news_id = n.id) AS like_count,
		       (SELECT COUNT(*) FROM news_saves ns WHERE ns.news_id = n.id) AS save_count,
		       (SELECT COUNT(*) FROM news_comments nc WHERE nc.news_id = n.id) AS comment_count,
		       EXISTS(SELECT 1 FROM news_likes nl WHERE nl.news_id = n.id AND nl.user_id = $1) AS liked_by_me,
		       EXISTS(SELECT 1 FROM news_saves ns WHERE ns.news_id = n.id AND ns.user_id = $1) AS saved_by_me
		FROM news n
		ORDER BY n.id DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.News
	for rows.Next() {
		var n domain.News
		var translations []byte
		if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.CreatedAt, &translations, &n.LikeCount, &n.SaveCount, &n.CommentCount, &n.LikedByMe, &n.SavedByMe); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(translations, &n.Translations); err != nil {
			return nil, err
		}
		comments, err := r.Comments(ctx, n.ID)
		if err != nil {
			return nil, err
		}
		n.Comments = comments
		out = append(out, n)
	}
	return out, rows.Err()
}

func (r *NewsRepository) ToggleLike(ctx context.Context, userID, newsID int64) (domain.NewsReactionResponse, error) {
	var response domain.NewsReactionResponse
	err := r.db.QueryRow(ctx, `
		WITH deleted AS (
			DELETE FROM news_likes WHERE user_id = $1 AND news_id = $2 RETURNING 1
		), inserted AS (
			INSERT INTO news_likes (user_id, news_id)
			SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM deleted)
			ON CONFLICT DO NOTHING
			RETURNING 1
		)
		SELECT EXISTS(SELECT 1 FROM inserted), (SELECT COUNT(*) FROM news_likes WHERE news_id = $2)
	`, userID, newsID).Scan(&response.Active, &response.Count)
	return response, err
}

func (r *NewsRepository) ToggleSave(ctx context.Context, userID, newsID int64) (domain.NewsReactionResponse, error) {
	var response domain.NewsReactionResponse
	err := r.db.QueryRow(ctx, `
		WITH deleted AS (
			DELETE FROM news_saves WHERE user_id = $1 AND news_id = $2 RETURNING 1
		), inserted AS (
			INSERT INTO news_saves (user_id, news_id)
			SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM deleted)
			ON CONFLICT DO NOTHING
			RETURNING 1
		)
		SELECT EXISTS(SELECT 1 FROM inserted), (SELECT COUNT(*) FROM news_saves WHERE news_id = $2)
	`, userID, newsID).Scan(&response.Active, &response.Count)
	return response, err
}

func (r *NewsRepository) AddComment(ctx context.Context, userID, newsID int64, content string) (domain.NewsComment, error) {
	var comment domain.NewsComment
	err := r.db.QueryRow(ctx, `
		INSERT INTO news_comments (user_id, news_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, news_id, user_id, content, created_at
	`, userID, newsID, content).Scan(&comment.ID, &comment.NewsID, &comment.UserID, &comment.Content, &comment.CreatedAt)
	if err != nil {
		return comment, err
	}
	err = r.db.QueryRow(ctx, `SELECT login FROM users WHERE id = $1`, userID).Scan(&comment.UserLogin)
	return comment, err
}

func (r *NewsRepository) Comments(ctx context.Context, newsID int64) ([]domain.NewsComment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT nc.id, nc.news_id, nc.user_id, u.login, nc.content, nc.created_at
		FROM news_comments nc
		JOIN users u ON u.id = nc.user_id
		WHERE nc.news_id = $1
		ORDER BY nc.created_at DESC, nc.id DESC
	`, newsID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.NewsComment
	for rows.Next() {
		var comment domain.NewsComment
		if err := rows.Scan(&comment.ID, &comment.NewsID, &comment.UserID, &comment.UserLogin, &comment.Content, &comment.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}
	return comments, rows.Err()
}

func (r *NewsRepository) UserActivity(ctx context.Context, userID int64) (domain.UserNewsActivity, error) {
	var activity domain.UserNewsActivity

	liked, err := r.newsByUserRelation(ctx, userID, "news_likes")
	if err != nil {
		return activity, err
	}
	activity.LikedNews = liked

	saved, err := r.newsByUserRelation(ctx, userID, "news_saves")
	if err != nil {
		return activity, err
	}
	activity.SavedNews = saved

	comments, err := r.userComments(ctx, userID)
	if err != nil {
		return activity, err
	}
	activity.Comments = comments
	activity.LikedCount = int64(len(activity.LikedNews))
	activity.SavedCount = int64(len(activity.SavedNews))
	activity.CommentCount = int64(len(activity.Comments))
	return activity, nil
}

func (r *NewsRepository) newsByUserRelation(ctx context.Context, userID int64, table string) ([]domain.News, error) {
	rows, err := r.db.Query(ctx, `
		SELECT n.id, n.title, n.content, n.created_at, n.translations,
		       (SELECT COUNT(*) FROM news_likes nl WHERE nl.news_id = n.id) AS like_count,
		       (SELECT COUNT(*) FROM news_saves ns WHERE ns.news_id = n.id) AS save_count,
		       (SELECT COUNT(*) FROM news_comments nc WHERE nc.news_id = n.id) AS comment_count
		FROM news n
		JOIN `+table+` rel ON rel.news_id = n.id
		WHERE rel.user_id = $1
		ORDER BY rel.created_at DESC, n.id DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.News
	for rows.Next() {
		var n domain.News
		var translations []byte
		if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.CreatedAt, &translations, &n.LikeCount, &n.SaveCount, &n.CommentCount); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(translations, &n.Translations); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}

func (r *NewsRepository) userComments(ctx context.Context, userID int64) ([]domain.NewsComment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT nc.id, nc.news_id, n.title, nc.user_id, u.login, nc.content, nc.created_at
		FROM news_comments nc
		JOIN news n ON n.id = nc.news_id
		JOIN users u ON u.id = nc.user_id
		WHERE nc.user_id = $1
		ORDER BY nc.created_at DESC, nc.id DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.NewsComment
	for rows.Next() {
		var comment domain.NewsComment
		if err := rows.Scan(&comment.ID, &comment.NewsID, &comment.NewsTitle, &comment.UserID, &comment.UserLogin, &comment.Content, &comment.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}
	return comments, rows.Err()
}
