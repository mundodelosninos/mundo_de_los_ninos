'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetToken, setResetToken] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(getApiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Se ha enviado un enlace de recuperación a tu email'
        });
        // En desarrollo, mostrar el token
        if (data.token) {
          setResetToken(data.token);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Error al solicitar recuperación de contraseña'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error de conexión'
      });
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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            🔐 Recuperar Contraseña
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        {message.text && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* En desarrollo: mostrar el enlace */}
        {resetToken && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b',
            fontSize: '0.85rem'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Modo Desarrollo:</p>
            <button
              onClick={() => router.push(`/reset-password?token=${resetToken}`)}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                width: '100%'
              }}
            >
              Ir a restablecer contraseña
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
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
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
