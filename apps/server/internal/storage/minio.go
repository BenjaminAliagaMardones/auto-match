package storage

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// MinioStorage implementa ObjectStorage sobre un bucket S3-compatible
// (MinIO en desarrollo; cualquier S3 en producción).
type MinioStorage struct {
	client    *minio.Client
	bucket    string
	publicURL string
}

type MinioConfig struct {
	Endpoint  string // host:puerto que usa el server para hablar con MinIO (ej. minio:9000)
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
	// PublicURL es la base con la que el navegador accede a los objetos
	// (ej. http://localhost:9000). Difiere del Endpoint cuando el server
	// corre dentro de Docker.
	PublicURL string
}

func NewMinioStorage(ctx context.Context, cfg MinioConfig) (*MinioStorage, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("minio: crear cliente: %w", err)
	}

	s := &MinioStorage{
		client:    client,
		bucket:    cfg.Bucket,
		publicURL: strings.TrimRight(cfg.PublicURL, "/"),
	}
	if err := s.ensureBucket(ctx); err != nil {
		return nil, err
	}
	return s, nil
}

// ensureBucket crea el bucket si no existe y lo deja con lectura pública
// (las fotos de listings se sirven directo desde el bucket).
func (s *MinioStorage) ensureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return fmt.Errorf("minio: verificar bucket: %w", err)
	}
	if !exists {
		if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
			return fmt.Errorf("minio: crear bucket: %w", err)
		}
	}

	policy := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [{
			"Effect": "Allow",
			"Principal": {"AWS": ["*"]},
			"Action": ["s3:GetObject"],
			"Resource": ["arn:aws:s3:::%s/*"]
		}]
	}`, s.bucket)
	if err := s.client.SetBucketPolicy(ctx, s.bucket, policy); err != nil {
		return fmt.Errorf("minio: aplicar política pública: %w", err)
	}
	return nil
}

func (s *MinioStorage) Upload(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) (string, error) {
	_, err := s.client.PutObject(ctx, s.bucket, objectName, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("minio: subir objeto: %w", err)
	}
	return fmt.Sprintf("%s/%s/%s", s.publicURL, s.bucket, objectName), nil
}
