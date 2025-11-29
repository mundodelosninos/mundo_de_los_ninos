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

interface Attendance {
  id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'early_departure';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  ate?: 'ate_all' | 'ate_some' | 'did_not_eat';
  slept?: 'slept_well' | 'slept_little' | 'did_not_sleep';
  participatedInActivities?: 'participated_fully' | 'participated_partially' | 'did_not_participate';
  mood?: 'happy' | 'sad' | 'tired' | 'energetic' | 'calm' | 'upset';
  student: Student;
  markedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

interface AttendanceHistoryProps {
  userRole: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ userRole }) => {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'attendance' | 'activities'>('attendance');
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const attendanceStatuses = [
    { value: 'present', label: '✅ Presente', color: '#dcfce7', textColor: '#166534' },
    { value: 'absent', label: '❌ Ausente', color: '#fee2e2', textColor: '#dc2626' },
    { value: 'late', label: '⏰ Tarde', color: '#fef3c7', textColor: '#d97706' },
    { value: 'early_departure', label: '📝 Salida temprana', color: '#fef3c7', textColor: '#d97706' },
  ];

  const moodOptions = [
    { value: 'happy', label: 'Feliz', emoji: '😊' },
    { value: 'sad', label: 'Triste', emoji: '😢' },
    { value: 'tired', label: 'Cansado', emoji: '😴' },
    { value: 'energetic', label: 'Energético', emoji: '⚡' },
    { value: 'calm', label: 'Tranquilo', emoji: '😌' },
    { value: 'upset', label: 'Molesto', emoji: '😠' },
  ];

  const foodOptions = [
    { value: 'ate_all', label: 'Comió todo', emoji: '🍽️', color: '#22c55e' },
    { value: 'ate_some', label: 'Comió algo', emoji: '🍴', color: '#f59e0b' },
    { value: 'did_not_eat', label: 'No comió', emoji: '❌', color: '#ef4444' },
  ];

  const sleepOptions = [
    { value: 'slept_well', label: 'Durmió bien', emoji: '😴', color: '#22c55e' },
    { value: 'slept_little', label: 'Durmió poco', emoji: '😪', color: '#f59e0b' },
    { value: 'did_not_sleep', label: 'No durmió', emoji: '😳', color: '#ef4444' },
  ];

  const activityParticipationOptions = [
    { value: 'participated_fully', label: 'Participó completamente', emoji: '✅', color: '#22c55e' },
    { value: 'participated_partially', label: 'Participó parcialmente', emoji: '⚠️', color: '#f59e0b' },
    { value: 'did_not_participate', label: 'No participó', emoji: '❌', color: '#ef4444' },
  ];

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
      fetchAttendances();
      fetchActivities();
    }
  }, [token, startDate, endDate, selectedStudent, selectedGroup]);

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

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      if (selectedStudent) {
        params.append('studentId', selectedStudent);
      }
      if (selectedGroup) {
        params.append('groupId', selectedGroup);
      }

      const response = await fetch(getApiUrl(`attendance?${params}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendances(data);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      if (selectedStudent) {
        params.append('studentId', selectedStudent);
      }
      if (selectedGroup) {
        params.append('groupId', selectedGroup);
      }

      const response = await fetch(getApiUrl(`attendance/activities?${params}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const statusConfig = attendanceStatuses.find(s => s.value === status);
    return {
      backgroundColor: statusConfig?.color || '#f3f4f6',
      color: statusConfig?.textColor || '#6b7280',
    };
  };

  const getActivityStatusStyle = (status: string) => {
    const statusConfig = activityStatuses.find(s => s.value === status);
    return {
      backgroundColor: statusConfig?.color || '#f3f4f6',
      color: statusConfig?.textColor || '#6b7280',
    };
  };

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    // If end date is before the new start date, update it to match the start date
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
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
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 1.5rem 0'
        }}>
          📊 Historial de Asistencia y Actividades
        </h2>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Fecha inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '5px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Fecha final
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '5px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {userRole !== 'parent' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Estudiante
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(e.target.value);
                    if (e.target.value) setSelectedGroup('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Todos los estudiantes</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Grupo
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    if (e.target.value) setSelectedStudent('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Todos los grupos</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'attendance' ? '#dbeafe' : '#f3f4f6',
              color: activeTab === 'attendance' ? '#1d4ed8' : '#6b7280'
            }}
          >
            📝 Asistencia ({attendances.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'activities' ? '#dbeafe' : '#f3f4f6',
              color: activeTab === 'activities' ? '#1d4ed8' : '#6b7280'
            }}
          >
            🎯 Actividades ({activities.length})
          </button>
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            Cargando...
          </div>
        )}

        {/* Attendance History Tab */}
        {activeTab === 'attendance' && !loading && (
          <div>
            {attendances.length === 0 ? (
              <p style={{
                color: '#666',
                textAlign: 'center',
                padding: '2rem 0',
                margin: 0
              }}>
                No hay registros de asistencia para el período seleccionado
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {attendances.map((attendance) => (
                  <div key={attendance.id} style={{
                    padding: '1.25rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div>
                        <p style={{
                          fontWeight: '600',
                          fontSize: '1rem',
                          color: '#333',
                          margin: 0
                        }}>
                          {attendance.student.firstName} {attendance.student.lastName}
                        </p>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#666',
                          margin: '0.25rem 0 0 0'
                        }}>
                          📅 {new Date(attendance.date + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {attendance.checkInTime && (
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#666',
                            margin: '0.25rem 0 0 0'
                          }}>
                            🕐 Entrada: {attendance.checkInTime}
                            {attendance.checkOutTime && ` | Salida: ${attendance.checkOutTime}`}
                          </p>
                        )}
                      </div>

                      <span style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        borderRadius: '20px',
                        ...getStatusStyle(attendance.status)
                      }}>
                        {attendanceStatuses.find(s => s.value === attendance.status)?.label}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}>
                      {attendance.ate && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <span>{foodOptions.find(f => f.value === attendance.ate)?.emoji || '🍽️'}</span>
                          <span style={{
                            color: foodOptions.find(f => f.value === attendance.ate)?.color || '#666',
                            fontWeight: '500'
                          }}>
                            {foodOptions.find(f => f.value === attendance.ate)?.label || 'Comió'}
                          </span>
                        </div>
                      )}
                      {attendance.slept && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <span>{sleepOptions.find(s => s.value === attendance.slept)?.emoji || '😴'}</span>
                          <span style={{
                            color: sleepOptions.find(s => s.value === attendance.slept)?.color || '#666',
                            fontWeight: '500'
                          }}>
                            {sleepOptions.find(s => s.value === attendance.slept)?.label || 'Durmió'}
                          </span>
                        </div>
                      )}
                      {attendance.participatedInActivities && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <span>{activityParticipationOptions.find(a => a.value === attendance.participatedInActivities)?.emoji || '✅'}</span>
                          <span style={{
                            color: activityParticipationOptions.find(a => a.value === attendance.participatedInActivities)?.color || '#666',
                            fontWeight: '500'
                          }}>
                            {activityParticipationOptions.find(a => a.value === attendance.participatedInActivities)?.label || 'Participó'}
                          </span>
                        </div>
                      )}
                      {attendance.mood && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <span>{moodOptions.find(m => m.value === attendance.mood)?.emoji || '😊'}</span>
                          <span style={{ color: '#666', fontWeight: '500' }}>
                            Estado: {moodOptions.find(m => m.value === attendance.mood)?.label || 'Feliz'}
                          </span>
                        </div>
                      )}
                    </div>

                    {attendance.notes && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#fffbeb',
                        borderLeft: '3px solid #f59e0b',
                        borderRadius: '4px'
                      }}>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#92400e',
                          margin: 0
                        }}>
                          <strong>Notas:</strong> {attendance.notes}
                        </p>
                      </div>
                    )}

                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #e5e7eb',
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      Registrado por {attendance.markedBy.firstName} {attendance.markedBy.lastName} el{' '}
                      {new Date(attendance.createdAt).toLocaleString('es-ES')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activities History Tab */}
        {activeTab === 'activities' && !loading && (
          <div>
            {activities.length === 0 ? (
              <p style={{
                color: '#666',
                textAlign: 'center',
                padding: '2rem 0',
                margin: 0
              }}>
                No hay actividades para el período seleccionado
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {(() => {
                  const { batched, individual } = groupActivitiesByBatch();
                  const renderActivity = (activity: Activity) => (
                    <div key={activity.id} style={{
                      padding: '1.25rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem'
                      }}>
                        <div>
                          <h4 style={{
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: '#333',
                            margin: 0
                          }}>
                            {activity.title}
                          </h4>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#666',
                            margin: '0.25rem 0 0 0'
                          }}>
                            👤 {activity.student.firstName} {activity.student.lastName}
                          </p>
                        </div>

                        <span style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          borderRadius: '20px',
                          ...getActivityStatusStyle(activity.status)
                        }}>
                          {activityStatuses.find(s => s.value === activity.status)?.label}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#666'
                      }}>
                        <p style={{ margin: 0 }}>
                          <span style={{ fontWeight: '500' }}>📁 Tipo:</span>{' '}
                          {activityTypes.find(t => t.value === activity.type)?.label}
                        </p>
                        <p style={{ margin: 0 }}>
                          <span style={{ fontWeight: '500' }}>📅 Fecha:</span>{' '}
                          {new Date(activity.startTime).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p style={{ margin: 0 }}>
                          <span style={{ fontWeight: '500' }}>🕐 Horario:</span>{' '}
                          {new Date(activity.startTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' - '}
                          {new Date(activity.endTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {activity.description && (
                          <p style={{ margin: 0 }}>
                            <span style={{ fontWeight: '500' }}>📝 Descripción:</span> {activity.description}
                          </p>
                        )}
                        {activity.notes && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: '#fffbeb',
                            borderLeft: '3px solid #f59e0b',
                            borderRadius: '4px'
                          }}>
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#92400e',
                              margin: 0
                            }}>
                              <strong>Notas:</strong> {activity.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #e5e7eb',
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        Asignada por {activity.assignedBy.firstName} {activity.assignedBy.lastName} el{' '}
                        {new Date(activity.createdAt).toLocaleString('es-ES')}
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
                            padding: '1.25rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '10px',
                            border: '2px solid #2563eb',
                            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)'
                          }}>
                            <button
                              onClick={() => toggleBatch(batchId)}
                              style={{
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: isExpanded ? '1rem' : 0
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem'
                                  }}>
                                    <span style={{ fontSize: '1.25rem' }}>
                                      {isExpanded ? '▼' : '▶'}
                                    </span>
                                    <h4 style={{
                                      fontWeight: '600',
                                      fontSize: '1rem',
                                      color: '#1e3a8a',
                                      margin: 0
                                    }}>
                                      {firstActivity.title}
                                    </h4>
                                    <span style={{
                                      padding: '0.25rem 0.75rem',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      borderRadius: '20px',
                                      backgroundColor: '#1e40af',
                                      color: 'white',
                                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                    }}>
                                      👥 {batchActivities.length} estudiantes
                                    </span>
                                  </div>
                                  <p style={{
                                    fontSize: '0.875rem',
                                    color: '#1e3a8a',
                                    margin: 0,
                                    fontWeight: '500'
                                  }}>
                                    📅 {new Date(firstActivity.startTime).toLocaleDateString('es-ES', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })} • 🕐 {new Date(firstActivity.startTime).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} - {new Date(firstActivity.endTime).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <span style={{
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  borderRadius: '20px',
                                  ...getActivityStatusStyle(firstActivity.status)
                                }}>
                                  {activityStatuses.find(s => s.value === firstActivity.status)?.label}
                                </span>
                              </div>
                            </button>

                            {isExpanded && (
                              <div style={{
                                display: 'grid',
                                gap: '0.75rem',
                                paddingTop: '1rem',
                                borderTop: '2px solid #93c5fd'
                              }}>
                                {batchActivities.map(activity => (
                                  <div key={activity.id} style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                  }}>
                                    <p style={{
                                      fontSize: '0.875rem',
                                      color: '#333',
                                      fontWeight: '500',
                                      margin: 0
                                    }}>
                                      👤 {activity.student.firstName} {activity.student.lastName}
                                    </p>
                                  </div>
                                ))}
                                {firstActivity.description && (
                                  <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'white',
                                    borderRadius: '8px'
                                  }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
                                      <span style={{ fontWeight: '500', color: '#111827' }}>📝 Descripción:</span> {firstActivity.description}
                                    </p>
                                  </div>
                                )}
                                {firstActivity.notes && (
                                  <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#fffbeb',
                                    borderLeft: '3px solid #f59e0b',
                                    borderRadius: '4px'
                                  }}>
                                    <p style={{
                                      fontSize: '0.875rem',
                                      color: '#92400e',
                                      margin: 0
                                    }}>
                                      <strong style={{ color: '#78350f' }}>Notas:</strong> {firstActivity.notes}
                                    </p>
                                  </div>
                                )}
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#9ca3af',
                                  fontStyle: 'italic'
                                }}>
                                  Asignada por {firstActivity.assignedBy.firstName} {firstActivity.assignedBy.lastName} el{' '}
                                  {new Date(firstActivity.createdAt).toLocaleString('es-ES')}
                                </div>
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
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
