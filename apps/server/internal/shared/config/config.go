package config

import (
	"errors"
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string

	// Bucket S3-compatible para imágenes (MinIO en desarrollo).
	S3Endpoint  string
	S3AccessKey string
	S3SecretKey string
	S3Bucket    string
	S3UseSSL    bool
	S3PublicURL string
}

func Load() (*Config, error) {
	c := &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		Port:        getenv("PORT", "8080"),
		S3Endpoint:  getenv("S3_ENDPOINT", "localhost:9000"),
		S3AccessKey: getenv("S3_ACCESS_KEY", "automatch"),
		S3SecretKey: getenv("S3_SECRET_KEY", "automatch-secret"),
		S3Bucket:    getenv("S3_BUCKET", "automatch"),
		S3UseSSL:    os.Getenv("S3_USE_SSL") == "true",
		S3PublicURL: getenv("S3_PUBLIC_URL", "http://localhost:9000"),
	}
	if c.DatabaseURL == "" {
		return nil, errors.New("DATABASE_URL es requerida")
	}
	if c.JWTSecret == "" {
		return nil, errors.New("JWT_SECRET es requerida")
	}
	return c, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
