package config

import (
	"errors"
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
}

func Load() (*Config, error) {
	c := &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		Port:        getenv("PORT", "8080"),
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
