import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export default function LoginForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in-up">
      <div className="form-group">
        <label className="form-label" htmlFor="login-email">
          Email
        </label>
        <input
          {...register('email')}
          id="login-email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="tu@email.com"
          autoComplete="email"
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="login-password">
          Contraseña
        </label>
        <input
          {...register('password')}
          id="login-password"
          type="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary"
        style={{ marginTop: '0.5rem' }}
      >
        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>

      <p className="auth-link">
        ¿No tienes cuenta? <Link to="/auth/register">Crear cuenta</Link>
      </p>
    </form>
  );
}
