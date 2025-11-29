'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '@/config/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'male' | 'female';
  allergies?: string;
  observations?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  parent?: User;
  groups?: Group[];
}

interface StudentManagementProps {
  userRole: string;
}

export default function StudentManagement({ userRole }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [parentEmailSearching, setParentEmailSearching] = useState(false);
  const [parentFound, setParentFound] = useState<User | null>(null);
  const [parentNotFound, setParentNotFound] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    allergies: '',
    observations: '',
    emergencyContact: '',
    emergencyPhone: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
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
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('students'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Error al cargar estudiantes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Debounced email search function
  const searchParentByEmail = useCallback(async (email: string) => {
    if (!email || email.length < 3) {
      setParentFound(null);
      setParentNotFound(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    setParentEmailSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`students/check-parent-email?email=${encodeURIComponent(email)}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.parent) {
          setParentFound(data.parent);
          setParentNotFound(false);
          // Preload parent data
          setFormData(prev => ({
            ...prev,
            parentFirstName: data.parent.firstName,
            parentLastName: data.parent.lastName,
            parentPhone: data.parent.phone || '',
          }));
        } else {
          setParentFound(null);
          setParentNotFound(true);
        }
      }
    } catch (err) {
      console.error('Error searching parent:', err);
    } finally {
      setParentEmailSearching(false);
    }
  }, []);

  // Debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.parentEmail) {
        searchParentByEmail(formData.parentEmail);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.parentEmail, searchParentByEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const url = editingStudent
        ? getApiUrl(`students/${editingStudent.id}`)
        : getApiUrl('students');

      const method = editingStudent ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchStudents();
        setShowAddForm(false);
        setEditingStudent(null);
        resetForm();

        // Show success message
        if (result.parentInvitationSent) {
          setSuccessMessage(`✅ Estudiante creado exitosamente. Se envió una invitación por email a ${formData.parentEmail} para configurar su contraseña.`);
          setTimeout(() => setSuccessMessage(''), 8000);
        } else {
          setSuccessMessage('✅ Estudiante guardado exitosamente.');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al guardar estudiante');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`students/${studentId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStudents();
      } else {
        setError('Error al eliminar estudiante');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate.split('T')[0],
      gender: student.gender,
      allergies: student.allergies || '',
      observations: student.observations || '',
      emergencyContact: student.emergencyContact || '',
      emergencyPhone: student.emergencyPhone || '',
      parentFirstName: student.parent?.firstName || '',
      parentLastName: student.parent?.lastName || '',
      parentEmail: student.parent?.email || '',
      parentPhone: student.parent?.phone || '',
    });
    setParentFound(null);
    setParentNotFound(false);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'male',
      allergies: '',
      observations: '',
      emergencyContact: '',
      emergencyPhone: '',
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPhone: '',
    });
    setParentFound(null);
    setParentNotFound(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Reset parent found status when email changes
    if (name === 'parentEmail') {
      setParentFound(null);
      setParentNotFound(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando estudiantes...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
          {userRole === 'admin' ? '👶 Gestión de Estudiantes' :
           userRole === 'teacher' ? '👶 Mis Estudiantes' : '👶 Mis Hijos'}
        </h2>

        {userRole === 'admin' && (
          <button
            onClick={() => {
              setEditingStudent(null);
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
            + Agregar Estudiante
          </button>
        )}
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

      {successMessage && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #6ee7b7'
        }}>
          {successMessage}
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
              {editingStudent ? 'Editar Estudiante' : 'Agregar Nuevo Estudiante'}
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
                    Fecha de Nacimiento:
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
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
                    Género:
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
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
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Alergias:
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={2}
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
                  Observaciones:
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  rows={2}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Contacto de Emergencia:
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Teléfono de Emergencia:
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
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

              <h4 style={{ margin: '1.5rem 0 1rem 0', color: '#333' }}>Información del Padre/Tutor</h4>

              {/* Email del Padre con búsqueda */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Email del Padre: *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    required={!editingStudent}
                    disabled={false}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${parentFound ? '#22c55e' : parentNotFound ? '#f59e0b' : '#ddd'}`,
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: 'white'
                    }}
                  />
                  {parentEmailSearching && (
                    <span style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      🔍
                    </span>
                  )}
                </div>

                {parentFound && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#d1fae5',
                    border: '1px solid #6ee7b7',
                    borderRadius: '5px',
                    fontSize: '0.9rem',
                    color: '#065f46'
                  }}>
                    ✅ Padre encontrado: <strong>{parentFound.firstName} {parentFound.lastName}</strong>
                    <br />
                    <small>Los datos del padre existente se usarán automáticamente.</small>
                  </div>
                )}

                {parentNotFound && !editingStudent && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '5px',
                    fontSize: '0.9rem',
                    color: '#92400e'
                  }}>
                    📧 Email no registrado. Se creará una cuenta nueva y se enviará una invitación para configurar la contraseña.
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Nombre del Padre:
                  </label>
                  <input
                    type="text"
                    name="parentFirstName"
                    value={formData.parentFirstName}
                    onChange={handleChange}
                    required={!editingStudent && !parentFound}
                    disabled={!editingStudent && !!parentFound}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: (!editingStudent && parentFound) ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Apellido del Padre:
                  </label>
                  <input
                    type="text"
                    name="parentLastName"
                    value={formData.parentLastName}
                    onChange={handleChange}
                    required={!editingStudent && !parentFound}
                    disabled={!editingStudent && !!parentFound}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#333',
                      backgroundColor: (!editingStudent && parentFound) ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Teléfono del Padre:
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  disabled={!editingStudent && !!parentFound}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    color: '#333',
                    backgroundColor: (!editingStudent && parentFound) ? '#f3f4f6' : 'white'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStudent(null);
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
                  {loading ? 'Guardando...' : (editingStudent ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {students.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '2rem',
          textAlign: 'center',
          color: '#666'
        }}>
          {userRole === 'admin' ? 'No hay estudiantes registrados' :
           userRole === 'teacher' ? 'No tienes estudiantes asignados' : 'No tienes hijos registrados'}
        </div>
      ) : isMobile ? (
        // Mobile Card View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {students.map((student) => {
            const age = Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365));

            return (
              <div
                key={student.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  padding: '1rem',
                  border: '1px solid #e5e7eb'
                }}
              >
                {/* Student Name and Gender */}
                <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: '0 0 0.25rem 0' }}>
                        {student.firstName} {student.lastName}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {student.gender === 'male' ? '👦 Niño' : '👧 Niña'} • {age} año{age !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(student)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Allergies and Observations */}
                  {(student.allergies || student.observations) && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                      {student.allergies && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          🚨 <strong>Alergias:</strong> {student.allergies}
                        </div>
                      )}
                      {student.observations && (
                        <div>
                          📝 <strong>Obs:</strong> {student.observations}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Parent Information */}
                {userRole !== 'parent' && student.parent && (
                  <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>
                      Padre/Tutor
                    </div>
                    <div style={{ fontWeight: '500', color: '#333', fontSize: '0.875rem' }}>
                      {student.parent.firstName} {student.parent.lastName}
                    </div>
                    {userRole === 'admin' && student.parent.email && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        📧 {student.parent.email}
                      </div>
                    )}
                    {userRole === 'admin' && student.parent.phone && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        📱 {student.parent.phone}
                      </div>
                    )}
                  </div>
                )}

                {/* Groups */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                    Grupos
                  </div>
                  {student.groups && student.groups.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {student.groups.map((group) => (
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
            );
          })}
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
                    Edad
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                    Género
                  </th>
                  {userRole !== 'parent' && (
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                      Padre/Tutor
                    </th>
                  )}
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#333' }}>
                    Grupos
                  </th>
                  {userRole === 'admin' && (
                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', color: '#333' }}>
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const age = Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365));

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333' }}>
                            {student.firstName} {student.lastName}
                          </div>
                          {(student.allergies || student.observations) && (
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                              {student.allergies && `🚨 ${student.allergies}`}
                              {student.allergies && student.observations && ' • '}
                              {student.observations && `📝 ${student.observations}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#333' }}>
                        {age} año{age !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '1rem', color: '#333' }}>
                        {student.gender === 'male' ? '👦 Niño' : '👧 Niña'}
                      </td>
                      {userRole !== 'parent' && (
                        <td style={{ padding: '1rem' }}>
                          {student.parent && (
                            <div>
                              <div style={{ fontWeight: '500', color: '#333' }}>
                                {student.parent.firstName} {student.parent.lastName}
                              </div>
                              {userRole === 'admin' && student.parent.email && (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {student.parent.email}
                                </div>
                              )}
                              {userRole === 'admin' && student.parent.phone && (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {student.parent.phone}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      <td style={{ padding: '1rem' }}>
                        {student.groups && student.groups.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {student.groups.map((group) => (
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
                              >
                                {group.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.8rem' }}>Sin grupos</span>
                        )}
                      </td>
                      {userRole === 'admin' && (
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(student)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '0.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '0.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
