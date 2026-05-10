package repository

import (
	"errors"

	"github.com/lib/pq"
)

func isUniqueViolation(err error) bool {
	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		// 23505 = unique_violation
		return pqErr.Code == "23505"
	}
	return false
}
