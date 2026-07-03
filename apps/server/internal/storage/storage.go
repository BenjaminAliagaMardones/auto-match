package storage

import (
	"context"
	"io"
)

// ObjectStorage abstrae el bucket de objetos (MinIO, S3, GCS...).
// Los servicios y handlers dependen de esta interfaz, no de un SDK
// concreto (Dependency Inversion, igual que PasswordHasher).
type ObjectStorage interface {
	// Upload guarda el objeto y devuelve la URL pública para accederlo.
	Upload(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) (string, error)
}
