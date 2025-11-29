'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  maxStudents?: number;
  isActive: boolean;
  createdAt: string;
  teacher?: Teacher;
  students?: Student[];
  studentCount: number;
}

interface GroupManagementProps {
  userRole: string;
}

export default function GroupManagement({ userRole }: GroupManagementProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showStudentSelector, setShowStudentSelector] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    maxStudents: 20,
    teacherId: '',
    studentIds: [] as string[],
  });

  useEffect(() => {
    fetchGroups();
    if (userRole === 'admin') {
      fetchTeachers();
    }
    fetchStudents();
  }, [userRole]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('groups'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        setError('Error al cargar grupos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Aquí necesitaríamos una API para obtener maestros
      // Por ahora usaremos datos mock
      setTeachers([
        { id: '435ae796-6f14-4a3e-b7dd-770524390c1d', firstName: 'Carmen', lastName: 'Rodríguez' },
        { id: 'f7090d7b-bcb8-4cc0-8ee5-126042914f03', firstName: 'María', lastName: 'López' },
      ]);
    } catch (err) {
      console.error('Error al cargar maestros:', err);
    }
  };

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
      }
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = editingGroup
        ? getApiUrl(`groups/${editingGroup.id}`)
        : getApiUrl('groups');

      const method = editingGroup ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        teacherId: formData.teacherId || undefined,
        studentIds: formData.studentIds.length > 0 ? formData.studentIds : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchGroups();
        setShowAddForm(false);
        setEditingGroup(null);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al guardar grupo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('¿Estás seguro de eliminar este grupo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`groups/${groupId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchGroups();
      } else {
        setError('Error al eliminar grupo');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color || '#3B82F6',
      maxStudents: group.maxStudents || 20,
      teacherId: group.teacher?.id || '',
      studentIds: group.students?.map(s => s.id) || [],
    });
    setShowAddForm(true);
  };

  const handleAddStudents = async (groupId: string, studentIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`groups/${groupId}/students`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentIds }),
      });

      if (response.ok) {
        await fetchGroups();
        setShowStudentSelector(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al agregar estudiantes');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    if (!confirm('¿Estás seguro de remover este estudiante del grupo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`groups/${groupId}/students/${studentId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchGroups();
      } else {
        setError('Error al remover estudiante');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      maxStudents: 20,
      teacherId: '',
      studentIds: [],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'maxStudents' ? parseInt(value) || 20 : value,
    });
  };

  const handleStudentSelection = (studentId: string) => {
    const isSelected = formData.studentIds.includes(studentId);
    if (isSelected) {
      setFormData({
        ...formData,
        studentIds: formData.studentIds.filter(id => id !== studentId),
      });
    } else {
      setFormData({
        ...formData,
        studentIds: [...formData.studentIds, studentId],
      });
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando grupos...</div>
      </div>
    );
  }

  const canManageGroups = userRole === 'admin' || userRole === 'teacher';

  // Function to determine if text should be dark or light based on background color
  const getTextColor = (hexColor: string) => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark text for light backgrounds, light text for dark backgrounds
    return luminance > 0.5 ? '#1f2937' : '#ffffff';
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
          {userRole === 'parent' ? '👥 Grupos de Mis Hijos' : '👥 Gestión de Grupos'}
        </h2>

        {canManageGroups && (
          <button
            onClick={() => {
              setEditingGroup(null);
              resetForm();
              setShowAddForm(true);
            }}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            + Crear Grupo
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
              {editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Nombre del Grupo:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    color: '#1f2937',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Descripción:
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    color: '#1f2937',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                    Color:
                  </label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: '3rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                    Máximo de Estudiantes:
                  </label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#1f2937',
                      fontSize: '15px'
                    }}
                  />
                </div>
              </div>

              {userRole === 'admin' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                    Maestro Asignado:
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      color: '#1f2937',
                      fontSize: '15px'
                    }}
                  >
                    <option value="">Seleccionar maestro</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Estudiantes:
                </label>
                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  {students.map(student => (
                    <label key={student.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      color: '#1f2937',
                      backgroundColor: formData.studentIds.includes(student.id) ? '#eff6ff' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '0.25rem'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.studentIds.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGroup(null);
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
                  {loading ? 'Guardando...' : (editingGroup ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de grupos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {groups.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: '#666'
          }}>
            {userRole === 'parent' ? 'Tus hijos no están asignados a ningún grupo' : 'No hay grupos creados'}
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: `3px solid ${group.color}`,
              }}
            >
              {/* Header del grupo */}
              <div style={{
                backgroundColor: group.color,
                color: getTextColor(group.color || '#3B82F6'),
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: getTextColor(group.color || '#3B82F6') }}>{group.name}</h3>
                  {canManageGroups && (userRole === 'admin' || group.teacher?.id === 'current-user-id') && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(group)}
                        style={{
                          backgroundColor: getTextColor(group.color || '#3B82F6') === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          color: getTextColor(group.color || '#3B82F6'),
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        style={{
                          backgroundColor: getTextColor(group.color || '#3B82F6') === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          color: getTextColor(group.color || '#3B82F6'),
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                {group.description && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9, color: getTextColor(group.color || '#3B82F6') }}>
                    {group.description}
                  </p>
                )}
              </div>

              {/* Contenido del grupo */}
              <div style={{ padding: '1rem' }}>
                {/* Info del maestro */}
                {group.teacher && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>👩‍🏫</span>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1f2937' }}>
                          {group.teacher.firstName} {group.teacher.lastName}
                        </div>
                        {userRole === 'admin' && group.teacher.email && (
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {group.teacher.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Estadísticas */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: group.color }}>
                      {group.studentCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Estudiantes</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4b5563' }}>
                      {group.maxStudents || 'Sin límite'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Máximo</div>
                  </div>
                </div>

                {/* Lista de estudiantes */}
                {group.students && group.students.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1f2937' }}>
                      Estudiantes:
                    </h4>
                    <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                      {group.students.map((student) => (
                        <div
                          key={student.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            border: '1px solid #f1f5f9',
                            borderRadius: '4px',
                            marginBottom: '0.25rem',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>
                              {student.firstName} {student.lastName}
                            </div>
                            {userRole !== 'parent' && student.parent && (
                              <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                Padre: {student.parent.firstName} {student.parent.lastName}
                              </div>
                            )}
                          </div>
                          {canManageGroups && (userRole === 'admin' || group.teacher?.id === 'current-user-id') && (
                            <button
                              onClick={() => handleRemoveStudent(group.id, student.id)}
                              style={{
                                backgroundColor: '#fee',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agregar estudiantes */}
                {canManageGroups && (userRole === 'admin' || group.teacher?.id === 'current-user-id') && (
                  <button
                    onClick={() => setShowStudentSelector(group.id)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.5rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px dashed #d1d5db',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: '#4b5563',
                      fontWeight: '500'
                    }}
                  >
                    + Agregar Estudiantes
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}