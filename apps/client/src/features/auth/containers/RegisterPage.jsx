import RegisterForm from '../ui/RegisterForm';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const { register: registerUser, isRegistering, registerError, user } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (data) => {
    registerUser(data, {
      onSuccess: () => {
        if (user) {
          navigate('/app/feed');
        } else {
          navigate('/auth/login', { state: { registered: true } });
        }
      },
      onError: (err) => {
        console.error("Falló el registro:", err);
      }
    });
  };

  return (
    <div className="auth-page">
      {/* Hero izquierdo */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-hero-logo animate-pulse-slow">🚗 AutoMatch</div>
          <p className="auth-hero-tagline">
            Tu próximo auto está a un swipe de distancia.
          </p>
        </div>
      </div>

      {/* Form derecho */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h1 className="auth-card-title">Crear cuenta</h1>
          <p className="auth-card-subtitle">Regístrate para empezar a explorar</p>

          {registerError && (
            <div className="alert-error">
              {registerError?.response?.status === 409
                ? 'Este email ya está registrado.'
                : 'Error al crear la cuenta. Inténtalo de nuevo.'}
            </div>
          )}

          <RegisterForm onSubmit={handleRegister} isLoading={isRegistering} />
        </div>
      </div>
    </div>
  );
}
