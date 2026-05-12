import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export default function RegisterForm({ onSubmit, isLoading }) {
    const [selectedRole, setSelectedRole] = useState('buyer');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const handleFormSubmit = (data) => {
        // Enviar email, password y role al handler
        onSubmit({
            email: data.email,
            password: data.password,
            role: selectedRole,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="animate-fade-in-up">
            <div className="form-group">
                <label className="form-label" htmlFor="register-email">Email</label>
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
                <label className="form-label" htmlFor="register-password">Contraseña</label>
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
                <label className="form-label" htmlFor="register-confirm">Confirmar Contraseña</label>
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
                <label className="form-label">¿Qué buscas?</label>
                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-option ${selectedRole === 'buyer' ? 'active' : ''}`}
                        onClick={() => setSelectedRole('buyer')}
                    >
                        <span className="role-option-emoji">🔍</span>
                        <span className="role-option-label">Comprar</span>
                    </button>
                    <button
                        type="button"
                        className={`role-option ${selectedRole === 'seller' ? 'active' : ''}`}
                        onClick={() => setSelectedRole('seller')}
                    >
                        <span className="role-option-emoji">🏷️</span>
                        <span className="role-option-label">Vender</span>
                    </button>
                </div>
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
                ¿Ya tienes cuenta?{' '}
                <Link to="/auth/login">Iniciar sesión</Link>
            </p>
        </form>
    );
}
