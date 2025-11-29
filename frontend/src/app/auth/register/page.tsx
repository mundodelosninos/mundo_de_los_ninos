'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Usuario registrado exitosamente. Redirigiendo...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const error = await response.json();
        setError(error.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '450px',
        width: '100%'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(1.5rem, 3vw, 2rem)'
        }}>
          <h1 style={{
            color: '#333',
            fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
            marginBottom: '0.5rem',
            lineHeight: '1.2'
          }}>
            🌟 Mundo de Niños
          </h1>
          <p style={{
            color: '#666',
            fontSize: 'clamp(0.9rem, 3vw, 1rem)'
          }}>
            Crear Nueva Cuenta
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: 'clamp(0.625rem, 2vw, 0.75rem)',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #feb2b2',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fff4',
            color: '#22c35e',
            padding: 'clamp(0.625rem, 2vw, 0.75rem)',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #9ae6b4',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
              }}>
                Nombre:
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                  boxSizing: 'border-box'
                }}
                placeholder="Tu nombre"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
              }}>
                Apellido:
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                  boxSizing: 'border-box'
                }}
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{
            marginBottom: '1rem',
            backgroundColor: '#f0f8ff',
            padding: 'clamp(0.625rem, 2vw, 0.75rem)',
            borderRadius: '5px',
            border: '1px solid #e0e7ff'
          }}>
            <p style={{
              margin: 0,
              color: '#4f46e5',
              fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
              lineHeight: '1.5'
            }}>
              📝 <strong>Nota:</strong> Te registras como Padre de Familia.
              Para otros roles, contacta al administrador.
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Contraseña:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Confirmar Contraseña:
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Repite la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#ccc' : '#22c55e',
              color: 'white',
              padding: 'clamp(0.625rem, 2vw, 0.75rem)',
              border: 'none',
              borderRadius: '5px',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#666',
            marginBottom: '1rem',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
          }}>
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Inicia sesión aquí
            </button>
          </p>

          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              color: '#666',
              padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
            }}
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}