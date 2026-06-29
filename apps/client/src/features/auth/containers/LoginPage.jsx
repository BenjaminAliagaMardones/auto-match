import LoginForm from '../ui/LoginForm';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar si venimos del registro exitoso
  const registeredSuccess = location.state?.registered;

  const handleLogin = (data) => {
    login(data, {
      onSuccess: () => {
        navigate('/app/feed');
      },
      onError: (err) => {
        console.error('Falló el login:', err);
      },
    });
  };

  return (
    <div className="auth-page">
      {/* Hero izquierdo */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-hero-logo animate-pulse-slow">🚗 AutoMatch</div>
          <p className="auth-hero-tagline">Desliza, conecta y encuentra tu auto perfecto.</p>
        </div>
      </div>

      {/* Form derecho */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h1 className="auth-card-title">Bienvenido de vuelta</h1>
          <p className="auth-card-subtitle">Ingresa tus credenciales para continuar</p>

          {registeredSuccess && (
            <div className="alert-success">¡Cuenta creada exitosamente! Ahora inicia sesión.</div>
          )}

          {error && (
            <div className="alert-error">Error al iniciar sesión. Verifica tus credenciales.</div>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
