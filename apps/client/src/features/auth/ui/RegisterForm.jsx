import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';

const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    role: z.enum(['buyer', 'seller'], { message: 'Selecciona un tipo de cuenta' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export default function RegisterForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      email: data.email,
      password: data.password,
      role: data.role,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="animate-fade-in-up">
      <div className="form-group">
        <label className="form-label" htmlFor="register-email">
          Email
        </label>
        <input
          {...register('email')}
          id="register-email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="tu@email.com"
          autoComplete="email"
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-password">
          Contraseña
        </label>
        <input
          {...register('password')}
          id="register-password"
          type="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
        />
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-confirm">
          Confirmar Contraseña
        </label>
        <input
          {...register('confirmPassword')}
          id="register-confirm"
          type="password"
          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
        />
        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-role">
          Tipo de cuenta
        </label>
        <select
          {...register('role')}
          id="register-role"
          defaultValue=""
          className={`form-input ${errors.role ? 'error' : ''}`}
        >
          <option value="" disabled>
            Selecciona…
          </option>
          <option value="buyer">Comprador</option>
          <option value="seller">Vendedor</option>
        </select>
        {errors.role && <p className="form-error">{errors.role.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary"
        style={{ marginTop: '0.5rem' }}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>

      <p className="auth-link">
        ¿Ya tienes cuenta? <Link to="/auth/login">Iniciar sesión</Link>
      </p>
    </form>
  );
}
