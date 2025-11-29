'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

interface Group {
  id: string;
  name: string;
  color: string;
  studentCount?: number;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  certifications?: string;
  isActive: boolean;
  createdAt: string;
  groups?: Group[];
}

interface TeacherManagementProps {
  userRole: string;
}

export default function TeacherManagement({ userRole }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    bio: '',
    certifications: '',
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('teachers'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        setError('Error al cargar maestros');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = editingTeacher
        ? getApiUrl(`teachers/${editingTeacher.id}`)
        : getApiUrl('teachers');

      const method = editingTeacher ? 'PATCH' : 'POST';

      // Para edición, incluir password solo si se proporcionó
      const payload = editingTeacher
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            ...(formData.password && { password: formData.password }), // Include password only if provided
            specialization: formData.specialization,
            bio: formData.bio,
            certifications: formData.certifications,
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTeachers();
        setShowAddForm(false);
        setEditingTeacher(null);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al guardar maestro');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('¿Estás seguro de desactivar este maestro?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`teachers/${teacherId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTeachers();
      } else {
        setError('Error al desactivar maestro');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      password: '', // Leave empty, admin can optionally change password
      specialization: teacher.specialization || '',
      bio: teacher.bio || '',
      certifications: teacher.certifications || '',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      specialization: '',
      bio: '',
      certifications: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading && teachers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando maestros...</div>
      </div>
    );
  }

  // Solo admin puede ver este componente
  if (userRole !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
        No tienes permisos para ver esta sección
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
          👨‍🏫 Gestión de Maestros
        </h2>

        <button
          onClick={() => {
            setEditingTeacher(null);
            resetForm();
            setShowAddForm(true);
          }}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          + Agregar Maestro
        </button>
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

      {/* Modal de formulario */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: '#333' }}>
              {editingTeacher ? 'Editar Maestro' : 'Agregar Nuevo Maestro'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
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
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
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
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
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
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Teléfono:
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              </div>

              {/* Password field - only shown for admins */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  {editingTeacher ? 'Nueva Contraseña (opcional):' : 'Contraseña:'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingTeacher}
                  placeholder={editingTeacher ? 'Dejar en blanco para mantener actual' : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    color: '#333',
                    backgroundColor: 'white'
                  }}
                />
                {editingTeacher && (
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                    Ingrese una nueva contraseña solo si desea cambiarla
                  </p>
                )}
              </div>

              {!editingTeacher && (
                <div style={{
                  backgroundColor: '#f0f9ff',
                  padding: '1rem',
                  borderRadius: '5px',
                  marginBottom: '1rem',
                  border: '1px solid #bae6fd'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>
                    <strong>ℹ️ Contraseña predeterminada:</strong> mundodeniños123
                    <br />
                    <span style={{ fontSize: '0.85rem' }}>
                      El maestro deberá cambiarla en su primer inicio de sesión
                    </span>
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Especialización:
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Ej: Educación Preescolar, Música, Arte"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    color: '#333',
                    backgroundColor: 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Biografía:
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Breve descripción del maestro"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    color: '#333',
                    backgroundColor: 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Certificaciones:
                </label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Certificaciones y títulos"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    color: '#333',
                    backgroundColor: 'white'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTeacher(null);
                    resetForm();
                  }}
                  style={{
                    backgroundColor: '#9ca3af',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#ccc' : '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Guardando...' : (editingTeacher ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de maestros */}
      {teachers.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '2rem',
          textAlign: 'center',
          color: '#666'
        }}>
          No hay maestros registrados
        </div>
      ) : isMobile ? (
        // Mobile Card View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '1rem',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Teacher Name and Status */}
              <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: '0 0 0.5rem 0' }}>
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <span style={{
                      backgroundColor: teacher.isActive ? '#dcfce7' : '#fee',
                      color: teacher.isActive ? '#166534' : '#991b1b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {teacher.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(teacher)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      title="Editar maestro"
                    >
                      ✏️
                    </button>
                    {teacher.isActive && (
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                        title="Desactivar maestro"
                      >
                        🚫
                      </button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {teacher.bio && (
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    {teacher.bio}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Contacto
                </div>
                <div style={{ fontSize: '0.875rem', color: '#333', marginBottom: '0.25rem' }}>
                  📧 {teacher.email}
                </div>
                {teacher.phone && (
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    📱 {teacher.phone}
                  </div>
                )}
              </div>

              {/* Specialization */}
              {teacher.specialization && (
                <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>
                    Especialización
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#333' }}>
                    {teacher.specialization}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {teacher.certifications && (
                <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>
                    Certificaciones
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {teacher.certifications}
                  </div>
                </div>
              )}

              {/* Groups */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Grupos Asignados
                </div>
                {teacher.groups && teacher.groups.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {teacher.groups.map((group) => (
                      <span
                        key={group.id}
                        style={{
                          backgroundColor: group.color,
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                        title={`${group.studentCount || 0} estudiantes`}
                      >
                        {group.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#999', fontSize: '0.875rem' }}>Sin grupos asignados</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table View
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                    Nombre
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                    Contacto
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                    Especialización
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                    Grupos
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', color: '#333' }}>
                    Estado
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', color: '#333' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        {teacher.bio && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {teacher.bio.length > 60 ? `${teacher.bio.substring(0, 60)}...` : teacher.bio}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#333' }}>
                          {teacher.email}
                        </div>
                        {teacher.phone && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            📞 {teacher.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#333' }}>
                      {teacher.specialization || <span style={{ color: '#999' }}>-</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {teacher.groups && teacher.groups.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {teacher.groups.map((group) => (
                            <span
                              key={group.id}
                              style={{
                                backgroundColor: group.color,
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: '500'
                              }}
                              title={`${group.studentCount || 0} estudiantes`}
                            >
                              {group.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>Sin grupos</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: teacher.isActive ? '#dcfce7' : '#fee',
                        color: teacher.isActive ? '#166534' : '#991b1b',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {teacher.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(teacher)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Editar maestro"
                        >
                          ✏️
                        </button>
                        {teacher.isActive && (
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '0.5rem',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                            title="Desactivar maestro"
                          >
                            🚫
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
