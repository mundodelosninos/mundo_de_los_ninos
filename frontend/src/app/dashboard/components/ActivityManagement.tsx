'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: 'meal' | 'nap' | 'play' | 'learning' | 'outdoor' | 'art' | 'music' | 'other';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startTime: Date;
  endTime: Date;
  notes?: string;
  batchId?: string;
  student: Student;
  assignedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ActivityManagementProps {
  userRole: string;
}

const ActivityManagement: React.FC<ActivityManagementProps> = ({ userRole }) => {
  const [token, setToken] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [activitySelectionMode, setActivitySelectionMode] = useState<'individual' | 'group' | 'all'>('individual');
  const [activityForm, setActivityForm] = useState<{
    title: string;
    description: string;
    type: 'meal' | 'nap' | 'play' | 'learning' | 'outdoor' | 'art' | 'music' | 'other';
    startTime: string;
    endTime: string;
    notes: string;
    studentId: string;
    groupId: string;
    applyToAll: boolean;
  }>({
    title: '',
    description: '',
    type: 'learning',
    startTime: '',
    endTime: '',
    notes: '',
    studentId: '',
    groupId: '',
    applyToAll: false,
  });
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const canManage = userRole === 'admin' || userRole === 'teacher';

  const activityTypes = [
    { value: 'learning', label: '📚 Aprendizaje' },
    { value: 'play', label: '🎯 Juego' },
    { value: 'meal', label: '🍽️ Comida' },
    { value: 'nap', label: '😴 Siesta' },
    { value: 'outdoor', label: '🌳 Al aire libre' },
    { value: 'art', label: '🎨 Arte' },
    { value: 'music', label: '🎵 Música' },
    { value: 'other', label: '📝 Otra' },
  ];

  const activityStatuses = [
    { value: 'scheduled', label: 'Programada', color: '#e0e7ff', textColor: '#4338ca' },
    { value: 'in_progress', label: 'En progreso', color: '#fef3c7', textColor: '#d97706' },
    { value: 'completed', label: 'Completada', color: '#dcfce7', textColor: '#166534' },
    { value: 'cancelled', label: 'Cancelada', color: '#fee2e2', textColor: '#dc2626' },
  ];

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchGroups();
      fetchActivities();
    }
  }, [token]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(getApiUrl('students'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(getApiUrl('groups'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      // Fetch all activities without date filtering to ensure we get everything
      const response = await fetch(getApiUrl('attendance/activities'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched activities:', data.length, 'activities'); // Debug log

        // Log activity dates for debugging timezone issues
        if (data.length > 0) {
          data.forEach((act: Activity) => {
            console.log('Activity:', act.title, 'Start:', act.startTime, 'Parsed:', new Date(act.startTime));
          });
        }

        // Show ALL activities for now to debug the timezone issue
        // Sort by start time
        const sortedActivities = data.sort((a: Activity, b: Activity) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        setActivities(sortedActivities);
      } else {
        console.error('Failed to fetch activities:', response.status);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For batch editing, update all activities in the batch
      if (editingBatchId) {
        const updateData = {
          title: activityForm.title,
          description: activityForm.description,
          type: activityForm.type,
          startTime: activityForm.startTime,
          endTime: activityForm.endTime,
          notes: activityForm.notes,
        };

        const response = await fetch(
          getApiUrl(`attendance/activities/batch/${editingBatchId}`),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          await fetchActivities();
          setShowActivityForm(false);
          setEditingBatchId(null);
          setActivityForm({
            title: '',
            description: '',
            type: 'learning',
            startTime: '',
            endTime: '',
            notes: '',
            studentId: '',
            groupId: '',
            applyToAll: false,
          });
          setActivitySelectionMode('individual');
          setError('');
          alert('✅ Grupo de actividades actualizado exitosamente');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error al actualizar grupo de actividades');
        }
        return;
      }

      // For editing, just update the single activity
      if (editingActivity) {
        const updateData = {
          title: activityForm.title,
          description: activityForm.description,
          type: activityForm.type,
          startTime: activityForm.startTime,
          endTime: activityForm.endTime,
          notes: activityForm.notes,
        };

        const response = await fetch(
          getApiUrl(`attendance/activities/${editingActivity.id}`),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          await fetchActivities();
          setShowActivityForm(false);
          setEditingActivity(null);
          setActivityForm({
            title: '',
            description: '',
            type: 'learning',
            startTime: '',
            endTime: '',
            notes: '',
            studentId: '',
            groupId: '',
            applyToAll: false,
          });
          setActivitySelectionMode('individual');
          setError('');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error al actualizar actividad');
        }
        return;
      }

      // For creating new activities, handle different selection modes
      let targetStudents: Student[] = [];

      if (activitySelectionMode === 'individual') {
        const student = students.find(s => s.id === activityForm.studentId);
        if (student) {
          targetStudents = [student];
        }
      } else if (activitySelectionMode === 'group') {
        const group = groups.find(g => g.id === activityForm.groupId);
        if (group && group.students) {
          targetStudents = group.students;
        }
      } else if (activitySelectionMode === 'all') {
        targetStudents = students;
      }

      if (targetStudents.length === 0) {
        setError('No hay estudiantes seleccionados');
        setLoading(false);
        return;
      }

      // Generate a batchId for group/all activities
      const batchId = targetStudents.length > 1 ? crypto.randomUUID() : undefined;

      // Create activity for each target student
      const promises = targetStudents.map(student =>
        fetch(getApiUrl('attendance/activities'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: activityForm.title,
            description: activityForm.description,
            type: activityForm.type,
            startTime: activityForm.startTime,
            endTime: activityForm.endTime,
            notes: activityForm.notes,
            studentId: student.id,
            batchId: batchId,
          }),
        })
      );

      const results = await Promise.all(promises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount === 0) {
        console.log('Activities created successfully, fetching updated list...');
        await fetchActivities();
        console.log('Activities after fetch:', activities.length);
        setShowActivityForm(false);
        setActivityForm({
          title: '',
          description: '',
          type: 'learning',
          startTime: '',
          endTime: '',
          notes: '',
          studentId: '',
          groupId: '',
          applyToAll: false,
        });
        setActivitySelectionMode('individual');
        setError('');
        alert(`✅ Actividad creada exitosamente para ${targetStudents.length} estudiante(s)`);
      } else {
        setError(`Error: ${failedCount} de ${targetStudents.length} actividades fallaron`);
      }
    } catch (error) {
      setError('Error al guardar actividad');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        getApiUrl(`attendance/activities/${activityId}`),
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchActivities();
        alert('✅ Actividad eliminada exitosamente');
      } else {
        const errorData = await response.json();
        alert('❌ Error al eliminar actividad: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('❌ Error al eliminar actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar todas las actividades de este grupo?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        getApiUrl(`attendance/activities/batch/${batchId}`),
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchActivities();
        alert('✅ Grupo de actividades eliminado exitosamente');
      } else {
        const errorData = await response.json();
        alert('❌ Error al eliminar actividad: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('❌ Error al eliminar actividad de actividades');
    } finally {
      setLoading(false);
    }
  };

  const groupActivitiesByBatch = () => {
    const batched: { [key: string]: Activity[] } = {};
    const individual: Activity[] = [];

    activities.forEach(activity => {
      if (activity.batchId) {
        if (!batched[activity.batchId]) {
          batched[activity.batchId] = [];
        }
        batched[activity.batchId].push(activity);
      } else {
        individual.push(activity);
      }
    });

    return { batched, individual };
  };

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333',
            margin: 0
          }}>
            🎯 Próximas Actividades (30 días)
          </h2>
        </div>

        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b'
          }}>
            {error}
          </div>
        )}

        {canManage && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#333',
              margin: 0
            }}>
              Gestión de Actividades
            </h3>
            <button
              onClick={() => setShowActivityForm(true)}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ➕ Nueva Actividad
            </button>
          </div>
        )}

        {/* Activity Form Modal */}
        {showActivityForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '36rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#333'
              }}>
                {editingBatchId ? '✏️ Editar Grupo de Actividades' : editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
              </h3>
              {editingBatchId && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#1e40af',
                    fontWeight: '500'
                  }}>
                    ℹ️ Los cambios se aplicarán a todas las actividades de este grupo
                  </p>
                </div>
              )}

              <form onSubmit={handleActivitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      color: '#333',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {!editingActivity && !editingBatchId && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Aplicar a
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActivitySelectionMode('individual');
                          setActivityForm({ ...activityForm, groupId: '', applyToAll: false });
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: activitySelectionMode === 'individual' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          backgroundColor: activitySelectionMode === 'individual' ? '#eff6ff' : 'white',
                          color: activitySelectionMode === 'individual' ? '#1e40af' : '#6b7280',
                          fontWeight: activitySelectionMode === 'individual' ? '600' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        👤 Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActivitySelectionMode('group');
                          setActivityForm({ ...activityForm, studentId: '', applyToAll: false });
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: activitySelectionMode === 'group' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          backgroundColor: activitySelectionMode === 'group' ? '#eff6ff' : 'white',
                          color: activitySelectionMode === 'group' ? '#1e40af' : '#6b7280',
                          fontWeight: activitySelectionMode === 'group' ? '600' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        👥 Grupo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActivitySelectionMode('all');
                          setActivityForm({ ...activityForm, studentId: '', groupId: '', applyToAll: true });
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: activitySelectionMode === 'all' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          backgroundColor: activitySelectionMode === 'all' ? '#eff6ff' : 'white',
                          color: activitySelectionMode === 'all' ? '#1e40af' : '#6b7280',
                          fontWeight: activitySelectionMode === 'all' ? '600' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🌐 Todos
                      </button>
                    </div>

                    {activitySelectionMode === 'individual' && (
                      <select
                        required
                        value={activityForm.studentId}
                        onChange={(e) => setActivityForm({ ...activityForm, studentId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '1rem',
                          color: '#333',
                          backgroundColor: 'white',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Seleccionar estudiante</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    )}

                    {activitySelectionMode === 'group' && (
                      <select
                        required
                        value={activityForm.groupId}
                        onChange={(e) => setActivityForm({ ...activityForm, groupId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '1rem',
                          color: '#333',
                          backgroundColor: 'white',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Seleccionar grupo</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {activitySelectionMode === 'all' && (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#1e40af'
                      }}>
                        ℹ️ Esta actividad se creará para todos los estudiantes
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    Tipo
                  </label>
                  <select
                    value={activityForm.type}
                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      color: '#333',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    {activityTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ minWidth: 0, width: '100%' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.25rem'
                    }}>
                      Hora de inicio
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={activityForm.startTime}
                      onChange={(e) => setActivityForm({ ...activityForm, startTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        color: '#333',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0, width: '100%' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.25rem'
                    }}>
                      Hora de fin
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={activityForm.endTime}
                      onChange={(e) => setActivityForm({ ...activityForm, endTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        color: '#333',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    Descripción
                  </label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      color: '#333',
                      backgroundColor: 'white',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    Notas
                  </label>
                  <textarea
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      color: '#333',
                      backgroundColor: 'white',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityForm(false);
                      setEditingActivity(null);
                      setEditingBatchId(null);
                      setActivityForm({
                        title: '',
                        description: '',
                        type: 'learning',
                        startTime: '',
                        endTime: '',
                        notes: '',
                        studentId: '',
                        groupId: '',
                        applyToAll: false,
                      });
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      color: '#374151',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: loading ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Guardando...' : editingActivity ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div>
          {activities.length === 0 ? (
            <p style={{
              color: '#666',
              textAlign: 'center',
              padding: '2rem 0',
              margin: 0
            }}>
              No hay actividades programadas para esta fecha
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(() => {
                const { batched, individual } = groupActivitiesByBatch();

                const renderActivity = (activity: Activity) => (
                  <div key={activity.id} style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{
                          fontWeight: '500',
                          color: '#333',
                          margin: 0
                        }}>{activity.title}</h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#666',
                          margin: '0.25rem 0 0 0'
                        }}>
                          {activity.student.firstName} {activity.student.lastName}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: '20px',
                          backgroundColor: activity.status === 'completed' ? '#dcfce7' : activity.status === 'in_progress' ? '#fef3c7' : '#fee2e2',
                          color: activity.status === 'completed' ? '#166534' : activity.status === 'in_progress' ? '#d97706' : '#dc2626'
                        }}>
                          {activityStatuses.find(s => s.value === activity.status)?.label}
                        </span>

                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setEditingActivity(activity);
                                setActivityForm({
                                  title: activity.title,
                                  description: activity.description || '',
                                  type: activity.type,
                                  startTime: new Date(activity.startTime).toISOString().slice(0, 16),
                                  endTime: new Date(activity.endTime).toISOString().slice(0, 16),
                                  notes: activity.notes || '',
                                  studentId: activity.student.id,
                                  groupId: '',
                                  applyToAll: false,
                                });
                                setShowActivityForm(true);
                              }}
                              style={{
                                color: '#2563eb',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                borderRadius: '4px'
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              style={{
                                color: '#dc2626',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                borderRadius: '4px'
                              }}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.875rem',
                      color: '#666',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      <p style={{ margin: 0 }}>
                        <span style={{ fontWeight: '500' }}>Tipo:</span> {activityTypes.find(t => t.value === activity.type)?.label}
                      </p>
                      <p style={{ margin: 0 }}>
                        <span style={{ fontWeight: '500' }}>Fecha:</span> {' '}
                        {new Date(activity.startTime).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p style={{ margin: 0 }}>
                        <span style={{ fontWeight: '500' }}>Horario:</span> {' '}
                        {new Date(activity.startTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {' '}
                        {new Date(activity.endTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {activity.description && (
                        <p style={{ margin: 0 }}>
                          <span style={{ fontWeight: '500' }}>Descripción:</span> {activity.description}
                        </p>
                      )}
                      {activity.notes && (
                        <p style={{ margin: 0 }}>
                          <span style={{ fontWeight: '500' }}>Notas:</span> {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );

                return (
                  <>
                    {/* Render batched activities */}
                    {Object.entries(batched).map(([batchId, batchActivities]) => {
                      const firstActivity = batchActivities[0];
                      const isExpanded = expandedBatches.has(batchId);

                      return (
                        <div key={batchId} style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '10px',
                          padding: '1rem',
                          border: '2px solid #e0e7ff'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.75rem'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                              }}>
                                <h4 style={{
                                  fontWeight: '600',
                                  color: '#333',
                                  margin: 0,
                                  fontSize: '1rem'
                                }}>
                                  {firstActivity.title}
                                </h4>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  borderRadius: '20px',
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af'
                                }}>
                                  👥 {batchActivities.length} estudiantes
                                </span>
                              </div>
                              <div style={{
                                fontSize: '0.875rem',
                                color: '#666'
                              }}>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <span style={{ fontWeight: '500' }}>Tipo:</span> {activityTypes.find(t => t.value === firstActivity.type)?.label}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <span style={{ fontWeight: '500' }}>Fecha:</span> {' '}
                                  {new Date(firstActivity.startTime).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                  <span style={{ fontWeight: '500' }}>Horario:</span> {' '}
                                  {new Date(firstActivity.startTime).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {' '}
                                  {new Date(firstActivity.endTime).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {firstActivity.description && (
                                  <p style={{ margin: '0.25rem 0' }}>
                                    <span style={{ fontWeight: '500' }}>Descripción:</span> {firstActivity.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {canManage && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingBatchId(batchId);
                                      setActivityForm({
                                        title: firstActivity.title,
                                        description: firstActivity.description || '',
                                        type: firstActivity.type,
                                        startTime: new Date(firstActivity.startTime).toISOString().slice(0, 16),
                                        endTime: new Date(firstActivity.endTime).toISOString().slice(0, 16),
                                        notes: firstActivity.notes || '',
                                        studentId: '',
                                        groupId: '',
                                        applyToAll: false,
                                      });
                                      setShowActivityForm(true);
                                    }}
                                    style={{
                                      color: '#2563eb',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBatch(batchId)}
                                    style={{
                                      color: '#dc2626',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => toggleBatch(batchId)}
                                style={{
                                  color: '#6b7280',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  fontSize: '1.25rem'
                                }}
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div style={{
                              marginTop: '0.75rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid #e0e7ff',
                              display: 'grid',
                              gap: '0.5rem'
                            }}>
                              {batchActivities.map(activity => (
                                <div key={activity.id} style={{
                                  padding: '0.5rem',
                                  backgroundColor: 'white',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span style={{ fontSize: '0.875rem', color: '#333' }}>
                                    {activity.student.firstName} {activity.student.lastName}
                                  </span>
                                  <span style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    borderRadius: '20px',
                                    backgroundColor: activity.status === 'completed' ? '#dcfce7' : activity.status === 'in_progress' ? '#fef3c7' : '#fee2e2',
                                    color: activity.status === 'completed' ? '#166534' : activity.status === 'in_progress' ? '#d97706' : '#dc2626'
                                  }}>
                                    {activityStatuses.find(s => s.value === activity.status)?.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Render individual activities */}
                    {individual.map(activity => renderActivity(activity))}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityManagement;
