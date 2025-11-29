'use client';

import { useState } from 'react';
import { getApiUrl } from '@/config/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface UserSettingsProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

export default function UserSettings({ user, onLogout, onUserUpdate }: UserSettingsProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('auth/profile'), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Perfil actualizado exitosamente' });
        onUserUpdate(data.user);
        setIsEditingProfile(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al actualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('auth/change-password'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Contraseña cambiada exitosamente' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al cambiar contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>⚙️ Configuración</h2>

      {/* Message Display */}
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

      {/* Profile Information */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#333', margin: 0 }}>Información Personal</h3>
          {!isEditingProfile && user.role === 'admin' && (
            <button
              onClick={() => setIsEditingProfile(true)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✏️ Editar
            </button>
          )}
        </div>

        {user.role !== 'admin' && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              ℹ️ Solo los administradores pueden modificar el nombre, correo electrónico y número de teléfono. Si necesita actualizar esta información, por favor contacte al administrador.
            </p>
          </div>
        )}

        {!isEditingProfile ? (
          <div>
            <p style={{ marginBottom: '0.75rem', color: '#1f2937' }}><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
            <p style={{ marginBottom: '0.75rem', color: '#1f2937' }}><strong>Email:</strong> {user.email}</p>
            <p style={{ marginBottom: '0', color: '#1f2937' }}><strong>Teléfono:</strong> {user.phone || 'No especificado'}</p>
            {/* <p style={{ marginBottom: '0', color: '#1f2937' }}><strong>Rol:</strong> {user.role}</p> */}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontWeight: '500' }}>
                Nombre
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontWeight: '500' }}>
                Apellido
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontWeight: '500' }}>
                Teléfono
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Guardando...' : '💾 Guardar'}
              </button>
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone || '',
                  });
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password - Only for Admin and Parents */}
      {(user.role === 'admin' || user.role === 'parent') && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#333', margin: 0 }}>Cambiar Contraseña</h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔒 Cambiar
              </button>
            )}
          </div>

          {!isChangingPassword ? (
            <p style={{ color: '#6b7280', margin: 0 }}>Haz clic en "Cambiar" para actualizar tu contraseña</p>
          ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontWeight: '500' }}>
                Contraseña Actual
              </label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontWeight: '500' }}>
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontWeight: '500' }}>
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Cambiando...' : '🔐 Cambiar Contraseña'}
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Logout */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>Sesión</h3>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Cierra tu sesión en este dispositivo</p>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
