package auth

import "golang.org/x/crypto/bcrypt"

// PasswordHasher define una estrategia para hashear y verificar contraseñas.
// Patrón Strategy: el AuthService depende de esta interface, no de una
// implementación concreta. Permite intercambiar el algoritmo (bcrypt, argon2,
// scrypt) o usar mocks en tests sin tocar la lógica de negocio.
type PasswordHasher interface {
	Hash(plain string) (string, error)
	Verify(plain, hashed string) error
}

type BcryptHasher struct {
	cost int
}

func NewBcryptHasher(cost int) *BcryptHasher {
	if cost < bcrypt.MinCost || cost > bcrypt.MaxCost {
		cost = bcrypt.DefaultCost
	}
	return &BcryptHasher{cost: cost}
}

func (h *BcryptHasher) Hash(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), h.cost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (h *BcryptHasher) Verify(plain, hashed string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain))
}
