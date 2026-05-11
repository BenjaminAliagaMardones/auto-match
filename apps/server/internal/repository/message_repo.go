package repository

import (
	"context"
	"database/sql"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
)

type MessageRepository interface {
	Create(ctx context.Context, m *domain.Message) error
	ListByMatch(ctx context.Context, matchID uuid.UUID) ([]*domain.Message, error)
}

type postgresMessageRepository struct {
	db *sql.DB
}

func NewPostgresMessageRepository(db *sql.DB) MessageRepository {
	return &postgresMessageRepository{db: db}
}

func (r *postgresMessageRepository) Create(ctx context.Context, m *domain.Message) error {
	const q = `
		INSERT INTO messages (id, match_id, sender_id, body, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, q, m.ID, m.MatchID, m.SenderID, m.Body, m.CreatedAt)
	return err
}

func (r *postgresMessageRepository) ListByMatch(ctx context.Context, matchID uuid.UUID) ([]*domain.Message, error) {
	const q = `
		SELECT id, match_id, sender_id, body, created_at
		FROM messages
		WHERE match_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, q, matchID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*domain.Message{}
	for rows.Next() {
		var m domain.Message
		if err := rows.Scan(&m.ID, &m.MatchID, &m.SenderID, &m.Body, &m.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, &m)
	}
	return out, rows.Err()
}
