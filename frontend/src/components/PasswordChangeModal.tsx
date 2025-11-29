'use client';

import { useState } from 'react';
import { getApiUrl } from '@/config/api';

interface PasswordChangeModalProps {
  onPasswordChanged: () => void;
}

export default function PasswordChangeModal({ onPasswordChanged }: PasswordChangeModalProps) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let label = '';
    let color = '';

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Débil';
      color = '#ef4444';
    } else if (score <= 3) {
      label = 'Media';
      color = '#f59e0b';
    } else if (score <= 4) {
      label = 'Buena';
      color = '#3b82f6';
    } else {
      label = 'Excelente';
      color = '#22c55e';
    }

    return { score, label, color };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Calcular fuerza de contraseña cuando se escribe la nueva contraseña
    if (name === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const validatePassword = (): boolean => {
    if (!formData.oldPassword) {
      setError('Por favor ingresa tu contraseña actual');
      return false;
    }

    if (!formData.newPassword) {
      setError('Por favor ingresa una nueva contraseña');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      setError('La contraseña debe contener mayúsculas, minúsculas y números');
      return false;
    }

    if (formData.newPassword === formData.oldPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        // Actualizar el usuario en localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.mustChangePassword = false;
          localStorage.setItem('user', JSON.stringify(user));
        }

        onPasswordChanged();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🔐</div>
          <h2 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '1.3rem' }}>
            Cambiar Contraseña
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
            Por seguridad, debes cambiar tu contraseña temporal antes de continuar
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #feb2b2',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
              Contraseña Actual:
            </label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box',
                color: '#333',
                backgroundColor: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
              Nueva Contraseña:
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box',
                color: '#333',
                backgroundColor: 'white',
                fontSize: '0.95rem'
              }}
            />

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: '600' }}>
                  {passwordStrength.label && `Seguridad: ${passwordStrength.label}`}
                </div>
              </div>
            )}

            <ul style={{
              margin: '0.35rem 0 0 0',
              padding: '0 0 0 1.1rem',
              fontSize: '0.7rem',
              color: '#666',
              lineHeight: '1.4'
            }}>
              <li>Al menos 8 caracteres</li>
              <li>Incluye mayúsculas y minúsculas</li>
              <li>Incluye al menos un número</li>
              <li>Se recomienda usar caracteres especiales</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
              Confirmar Nueva Contraseña:
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box',
                color: '#333',
                backgroundColor: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#ccc' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div style={{
          marginTop: '0.75rem',
          padding: '0.6rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '5px',
          border: '1px solid #bae6fd',
          fontSize: '0.7rem',
          color: '#0369a1',
          textAlign: 'center'
        }}>
          <strong>Importante:</strong> Guarda tu nueva contraseña en un lugar seguro
        </div>
      </div>
    </div>
  );
}
