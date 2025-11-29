'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        const error = await response.json();
        setError(error.message || 'Error al iniciar sesión');
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
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
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
            Iniciar Sesión
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                boxSizing: 'border-box'
              }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                boxSizing: 'border-box'
              }}
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#ccc' : '#3b82f6',
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
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#666',
            marginBottom: '1rem',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
          }}>
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Regístrate aquí
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}