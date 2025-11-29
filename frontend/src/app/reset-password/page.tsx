'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/config/api';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setMessage({
        type: 'error',
        text: 'Token no válido. Por favor, solicita un nuevo enlace de recuperación.'
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(getApiUrl('auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Contraseña restablecida exitosamente'
        });

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Error al restablecer contraseña. El token puede estar expirado.'
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
            🔒 Restablecer Contraseña
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Ingresa tu nueva contraseña
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

        {!token && !message.text && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #ef4444',
          }}>
            Token no encontrado. Por favor, solicita un nuevo enlace de recuperación.
          </div>
        )}

        {token && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Nueva Contraseña:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Mínimo 6 caracteres"
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
              disabled={loading || message.type === 'success'}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading || message.type === 'success' ? '#93c5fd' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading || message.type === 'success' ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Restableciendo...' : message.type === 'success' ? 'Redirigiendo...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}

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
