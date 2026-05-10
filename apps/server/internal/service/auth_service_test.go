package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/BenjaminAliagaMardones/automatch/internal/auth"
	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/google/uuid"
)

// fakeUserRepo es un mock del Repository: posibilita testear el servicio sin
// tocar la base de datos. Demuestra el valor del patrón Repository + DI.
type fakeUserRepo struct {
	byEmail map[string]*domain.User
	createErr error
}

func newFakeUserRepo() *fakeUserRepo {
	return &fakeUserRepo{byEmail: map[string]*domain.User{}}
}

func (f *fakeUserRepo) Create(_ context.Context, u *domain.User) error {
	if f.createErr != nil {
		return f.createErr
	}
	if _, ok := f.byEmail[u.Email]; ok {
		return repository.ErrEmailConflict
	}
	f.byEmail[u.Email] = u
	return nil
}

func (f *fakeUserRepo) FindByEmail(_ context.Context, email string) (*domain.User, error) {
	u, ok := f.byEmail[email]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return u, nil
}

func (f *fakeUserRepo) FindByID(_ context.Context, id uuid.UUID) (*domain.User, error) {
	for _, u := range f.byEmail {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, repository.ErrNotFound
}

func newSUT() (*service.AuthService, *fakeUserRepo) {
	repo := newFakeUserRepo()
	hasher := auth.NewBcryptHasher(4) // cost mínimo razonable para tests
	jwt := auth.NewJWTIssuer("test-secret", time.Hour)
	return service.NewAuthService(repo, hasher, jwt), repo
}

func TestRegister_OK(t *testing.T) {
	svc, repo := newSUT()
	u, err := svc.Register(context.Background(), service.RegisterInput{
		Email: "Foo@Bar.cl", Password: "secret123", Role: domain.RoleBuyer,
	})
	if err != nil {
		t.Fatalf("err: %v", err)
	}
	if u.Email != "foo@bar.cl" {
		t.Errorf("email no normalizado: %q", u.Email)
	}
	if _, ok := repo.byEmail["foo@bar.cl"]; !ok {
		t.Error("usuario no fue persistido")
	}
}

func TestRegister_WeakPassword(t *testing.T) {
	svc, _ := newSUT()
	_, err := svc.Register(context.Background(), service.RegisterInput{
		Email: "a@a.cl", Password: "123", Role: domain.RoleBuyer,
	})
	if !errors.Is(err, service.ErrWeakPassword) {
		t.Fatalf("esperaba ErrWeakPassword, got %v", err)
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	svc, _ := newSUT()
	in := service.RegisterInput{Email: "dup@x.cl", Password: "secret123", Role: domain.RoleBuyer}
	if _, err := svc.Register(context.Background(), in); err != nil {
		t.Fatalf("primer registro falló: %v", err)
	}
	_, err := svc.Register(context.Background(), in)
	if !errors.Is(err, service.ErrEmailTaken) {
		t.Fatalf("esperaba ErrEmailTaken, got %v", err)
	}
}

func TestLogin_OK(t *testing.T) {
	svc, _ := newSUT()
	in := service.RegisterInput{Email: "ok@x.cl", Password: "secret123", Role: domain.RoleSeller}
	if _, err := svc.Register(context.Background(), in); err != nil {
		t.Fatal(err)
	}
	token, u, err := svc.Login(context.Background(), "ok@x.cl", "secret123")
	if err != nil {
		t.Fatalf("login: %v", err)
	}
	if token == "" || u == nil {
		t.Fatal("token o user vacío")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	svc, _ := newSUT()
	in := service.RegisterInput{Email: "bad@x.cl", Password: "secret123", Role: domain.RoleBuyer}
	if _, err := svc.Register(context.Background(), in); err != nil {
		t.Fatal(err)
	}
	_, _, err := svc.Login(context.Background(), "bad@x.cl", "wrong-password")
	if !errors.Is(err, service.ErrInvalidCredentials) {
		t.Fatalf("esperaba ErrInvalidCredentials, got %v", err)
	}
}

func TestLogin_UnknownEmail(t *testing.T) {
	svc, _ := newSUT()
	_, _, err := svc.Login(context.Background(), "ghost@x.cl", "whatever")
	if !errors.Is(err, service.ErrInvalidCredentials) {
		t.Fatalf("esperaba ErrInvalidCredentials, got %v", err)
	}
}
