'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

// Helper function to get local date as YYYY-MM-DD without timezone conversion
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

type FoodStatus = 'ate_all' | 'ate_some' | 'did_not_eat';
type SleepStatus = 'slept_well' | 'slept_little' | 'did_not_sleep';
type ParticipationStatus = 'participated_fully' | 'participated_partially' | 'did_not_participate';
type DefecationStatus = 'yes' | 'no';
type MoodStatus = 'happy' | 'sad' | 'tired' | 'energetic' | 'calm' | 'upset';

interface Attendance {
  id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'early_departure';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  ate?: FoodStatus;
  slept?: SleepStatus;
  participatedInActivities?: ParticipationStatus;
  defecation?: DefecationStatus;
  mood?: MoodStatus;
  student: Student;
  markedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttendanceManagementProps {
  userRole: string;
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ userRole }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const [activeTab, setActiveTab] = useState<'attendance' | 'history'>('attendance');

  // Global filters (applied to both attendance and history tabs)
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groups, setGroups] = useState<any[]>([]);

  // Attendance state (for current day marking)
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [students, setStudents] = useState<Student[]>([]);
  const [bulkAttendance, setBulkAttendance] = useState<Record<string, any>>({});

  // History state
  const [historyAttendances, setHistoryAttendances] = useState<Attendance[]>([]);
  const [historyStartDate, setHistoryStartDate] = useState(
    getLocalDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );
  const [historyEndDate, setHistoryEndDate] = useState(getLocalDateString());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const attendanceStatuses = [
    { value: 'present', label: '✅ Presente' },
    { value: 'absent', label: '❌ Ausente' },
    { value: 'late', label: '⏰ Tarde' },
    { value: 'early_departure', label: '📝 Salida temprana' },
  ];

  // Snack (formerly food)
  const snackOptions = [
    { value: 'ate_all', label: '🍪 Comió todo' },
    { value: 'ate_some', label: '🍴 Comió un poco' },
    { value: 'did_not_eat', label: '❌ No comió' },
  ];

  // Lunch (formerly sleep)
  const lunchOptions = [
    { value: 'ate_all', label: '🍽️ Comió todo' },
    { value: 'ate_some', label: '🍴 Comió un poco' },
    { value: 'did_not_eat', label: '❌ No comió' },
  ];

  // Urination (formerly participation)
  const urinationOptions = [
    { value: 'yes', label: '✅ Sí' },
    { value: 'no', label: '❌ No' },
  ];

  // Defecation (new)
  const defecationOptions = [
    { value: 'yes', label: '✅ Sí' },
    { value: 'no', label: '❌ No' },
  ];

  const moodOptions = [
    { value: 'happy', label: '😊 Alegre', emoji: '😊' },
    { value: 'somewhat_happy', label: '🙂 Un poco alegre', emoji: '🙂' },
    { value: 'active', label: '⚡ Activo', emoji: '⚡' },
    { value: 'tired', label: '😴 Cansado', emoji: '😴' },
    { value: 'healthy', label: '💪 Saludable', emoji: '💪' },
    { value: 'unwell', label: '🤒 Indispuesto', emoji: '🤒' },
  ];

  const historyAttendanceStatuses = [
    { value: 'present', label: '✅ Presente', color: '#dcfce7', textColor: '#166534' },
    { value: 'absent', label: '❌ Ausente', color: '#fee2e2', textColor: '#dc2626' },
    { value: 'late', label: '⏰ Tarde', color: '#fef3c7', textColor: '#d97706' },
    { value: 'early_departure', label: '📝 Salida temprana', color: '#fef3c7', textColor: '#d97706' },
  ];

  const foodOptionsHistory = [
    { value: 'ate_all', label: 'Comió todo', emoji: '🍪', color: '#22c55e' },
    { value: 'ate_some', label: 'Comió algo', emoji: '🍴', color: '#f59e0b' },
    { value: 'did_not_eat', label: 'No comió', emoji: '❌', color: '#ef4444' },
  ];

  const sleepOptionsHistory = [
    { value: 'ate_all', label: 'Comió todo almuerzo', emoji: '🍽️', color: '#22c55e' },
    { value: 'ate_some', label: 'Comió algo almuerzo', emoji: '🍴', color: '#f59e0b' },
    { value: 'did_not_eat', label: 'No comió almuerzo', emoji: '❌', color: '#ef4444' },
  ];

  const participationOptionsHistory = [
    { value: 'yes', label: 'Sí orinó', emoji: '✅', color: '#22c55e' },
    { value: 'no', label: 'No orinó', emoji: '❌', color: '#ef4444' },
  ];

  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchGroups();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'attendance') {
      fetchStudents();
      fetchAttendances();
    }
  }, [token, selectedDate, activeTab]);

  useEffect(() => {
    if (token && activeTab === 'history') {
      fetchHistoryAttendances();
    }
  }, [token, historyStartDate, historyEndDate, selectedStudent, selectedGroup, activeTab]);


  const fetchStudents = async () => {
    try {
      const response = await fetch(getApiUrl('students'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);

        // Initialize bulk attendance for current students
        const initialBulkAttendance: Record<string, any> = {};
        data.forEach((student: Student) => {
          initialBulkAttendance[student.id] = {
            status: 'present',
            checkInTime: '',
            checkOutTime: '',
            notes: '',
            ate: 'ate_all',
            slept: 'ate_all',
            participatedInActivities: 'yes',
            defecation: 'yes',
            mood: 'happy',
          };
        });
        setBulkAttendance(initialBulkAttendance);
      } else {
        console.error('Failed to fetch students:', response.status);
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
    try {
      const params = new URLSearchParams({
        startDate: selectedDate,
        endDate: selectedDate,
      });

      const response = await fetch(getApiUrl(`attendance?${params}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendances(data);
      } else {
        console.error('Failed to fetch attendances:', response.status);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  };

  const fetchHistoryAttendances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: historyStartDate,
        endDate: historyEndDate,
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
        setHistoryAttendances(data);
      }
    } catch (error) {
      console.error('Error fetching history attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if bulkAttendance is empty
      if (Object.keys(bulkAttendance).length === 0) {
        setError('⚠️ No hay datos de asistencia. Por favor, recargue la página.');
        setLoading(false);
        return;
      }

      // Only include students who don't already have attendance for today
      const attendanceData = Object.entries(bulkAttendance)
        .filter(([studentId]) => !getAttendanceForStudent(studentId))
        .map(([studentId, data]) => ({
          studentId,
          status: data.status,
          checkInTime: data.checkInTime || null,
          checkOutTime: data.checkOutTime || null,
          notes: data.notes || null,
          ate: data.ate,
          slept: data.slept,
          participatedInActivities: data.participatedInActivities,
          defecation: data.defecation,
          mood: data.mood,
        }));

      if (attendanceData.length === 0) {
        setError('Todos los estudiantes ya tienen asistencia marcada para esta fecha');
        setLoading(false);
        return;
      }

      const response = await fetch(getApiUrl('attendance/bulk'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          attendances: attendanceData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchAttendances();
        setError('');
        alert(`✅ Asistencia marcada exitosamente para ${result.length} estudiante(s)`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al marcar asistencia');
      }
    } catch (error) {
      setError('Error al marcar asistencia: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (attendanceId: string, updates: any) => {
    // Optimistic update - update local state immediately
    setAttendances(prevAttendances =>
      prevAttendances.map(att =>
        att.id === attendanceId ? { ...att, ...updates } : att
      )
    );

    try {
      const response = await fetch(getApiUrl(`attendance/${attendanceId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Fetch fresh data from server to ensure consistency
        await fetchAttendances();
        setError('');
      } else {
        // Revert optimistic update on error
        await fetchAttendances();
        const errorData = await response.json();
        setError(errorData.message || 'Error al actualizar asistencia');
        alert('❌ ' + (errorData.message || 'Error al actualizar asistencia'));
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchAttendances();
      const errorMsg = 'Error al actualizar asistencia: ' + (error as Error).message;
      setError(errorMsg);
      alert('❌ ' + errorMsg);
    }
  };

  const updateBulkAttendance = (studentId: string, field: string, value: any) => {
    setBulkAttendance(prev => {
      const currentStudentData = prev[studentId] || {
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        notes: '',
        ate: 'ate_all',
        slept: 'ate_all',
        participatedInActivities: 'yes',
        defecation: 'yes',
        mood: 'happy',
      };

      return {
        ...prev,
        [studentId]: {
          ...currentStudentData,
          [field]: value,
        },
      };
    });
  };

  const getAttendanceForStudent = (studentId: string) => {
    return attendances.find(att => att.student.id === studentId);
  };

  const getHistoryStatusStyle = (status: string) => {
    const statusConfig = historyAttendanceStatuses.find(s => s.value === status);
    return {
      backgroundColor: statusConfig?.color || '#f3f4f6',
      color: statusConfig?.textColor || '#6b7280',
    };
  };

  const handleHistoryStartDateChange = (newStartDate: string) => {
    setHistoryStartDate(newStartDate);
    if (newStartDate > historyEndDate) {
      setHistoryEndDate(newStartDate);
    }
  };

  // Filter students based on selected student or group
  const getFilteredStudents = () => {
    if (selectedStudent) {
      return students.filter(s => s.id === selectedStudent);
    }
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group && group.students) {
        const groupStudentIds = group.students.map((s: Student) => s.id);
        return students.filter(s => groupStudentIds.includes(s.id));
      }
    }
    return students;
  };

  const canManage = userRole === 'admin' || userRole === 'teacher';

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
            📝 Asistencia Diaria
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Global Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filtrar por Estudiante
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setSelectedGroup(''); // Clear group filter when student is selected
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
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

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filtrar por Grupo
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedStudent(''); // Clear student filter when group is selected
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
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

          {(selectedStudent || selectedGroup) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setSelectedStudent('');
                  setSelectedGroup('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Limpiar Filtros
              </button>
            </div>
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
            📝 Asistencia
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? '#dbeafe' : '#f3f4f6',
              color: activeTab === 'history' ? '#1d4ed8' : '#6b7280'
            }}
          >
            📊 Historial
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {canManage && (
              <form onSubmit={handleBulkAttendanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#333',
                    margin: 0
                  }}>
                    Marcar Asistencia para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES')}
                  </h3>
                </div>

                {getFilteredStudents().length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    color: '#92400e'
                  }}>
                    <p style={{ margin: 0 }}>
                      {students.length === 0
                        ? '⚠️ No hay estudiantes disponibles. Por favor, agregue estudiantes primero.'
                        : '⚠️ No hay estudiantes que coincidan con el filtro seleccionado.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {getFilteredStudents().map((student) => {
                    const existingAttendance = getAttendanceForStudent(student.id);

                    return (
                      <div key={student.id} style={{
                        padding: '1.25rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <p style={{
                              fontWeight: '600',
                              fontSize: '1rem',
                              color: '#333',
                              margin: 0
                            }}>
                              {student.firstName} {student.lastName}
                            </p>
                            {userRole === 'admin' && student.parent && (
                              <p style={{
                                fontSize: '0.875rem',
                                color: '#666',
                                margin: '0.25rem 0 0 0'
                              }}>
                                Padre: {student.parent.firstName} {student.parent.lastName}
                              </p>
                            )}
                          </div>

                          <select
                            value={existingAttendance?.status || bulkAttendance[student.id]?.status || 'present'}
                            onChange={(e) => {
                              if (existingAttendance) {
                                handleUpdateAttendance(existingAttendance.id, { status: e.target.value });
                              } else {
                                updateBulkAttendance(student.id, 'status', e.target.value);
                              }
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#333',
                              backgroundColor: existingAttendance ? '#f0fdf4' : 'white'
                            }}
                          >
                            {attendanceStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                Snack
                              </label>
                              <select
                                value={existingAttendance?.ate || bulkAttendance[student.id]?.ate || 'ate_all'}
                                onChange={(e) => {
                                  if (existingAttendance) {
                                    handleUpdateAttendance(existingAttendance.id, { ate: e.target.value });
                                  } else {
                                    updateBulkAttendance(student.id, 'ate', e.target.value);
                                  }
                                }}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  color: '#333',
                                  backgroundColor: existingAttendance ? '#f0fdf4' : 'white'
                                }}
                              >
                                {snackOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                Almuerzo
                              </label>
                              <select
                                value={existingAttendance?.slept || bulkAttendance[student.id]?.slept || 'ate_all'}
                                onChange={(e) => {
                                  if (existingAttendance) {
                                    handleUpdateAttendance(existingAttendance.id, { slept: e.target.value });
                                  } else {
                                    updateBulkAttendance(student.id, 'slept', e.target.value);
                                  }
                                }}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  color: '#333',
                                  backgroundColor: existingAttendance ? '#f0fdf4' : 'white'
                                }}
                              >
                                {lunchOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                Micción
                              </label>
                              <select
                                value={existingAttendance?.participatedInActivities || bulkAttendance[student.id]?.participatedInActivities || 'yes'}
                                onChange={(e) => {
                                  if (existingAttendance) {
                                    handleUpdateAttendance(existingAttendance.id, { participatedInActivities: e.target.value });
                                  } else {
                                    updateBulkAttendance(student.id, 'participatedInActivities', e.target.value);
                                  }
                                }}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  color: '#333',
                                  backgroundColor: existingAttendance ? '#f0fdf4' : 'white'
                                }}
                              >
                                {urinationOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                Deposición
                              </label>
                              <select
                                value={existingAttendance?.defecation || bulkAttendance[student.id]?.defecation || 'yes'}
                                onChange={(e) => {
                                  if (existingAttendance) {
                                    handleUpdateAttendance(existingAttendance.id, { defecation: e.target.value });
                                  } else {
                                    updateBulkAttendance(student.id, 'defecation', e.target.value);
                                  }
                                }}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  color: '#333',
                                  backgroundColor: existingAttendance ? '#f0fdf4' : 'white'
                                }}
                              >
                                {defecationOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                Estado de ánimo
                              </label>
                              <select
                                value={existingAttendance?.mood || bulkAttendance[student.id]?.mood || 'happy'}
                                onChange={(e) => {
                                  if (existingAttendance) {
                                    handleUpdateAttendance(existingAttendance.id, { mood: e.target.value });
                                  } else {
                                    updateBulkAttendance(student.id, 'mood', e.target.value);
                                  }
                                }}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  color: '#333',
                                  backgroundColor: existingAttendance ? '#f0fdf4' : 'white'
                                }}
                              >
                                {moodOptions.map((mood) => (
                                  <option key={mood.value} value={mood.value}>
                                    {mood.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Notes/Observations Field */}
                          <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '0.5rem'
                            }}>
                              📝 Notas / Observaciones
                            </label>
                            <textarea
                              value={existingAttendance?.notes || bulkAttendance[student.id]?.notes || ''}
                              onChange={(e) => {
                                if (existingAttendance) {
                                  handleUpdateAttendance(existingAttendance.id, { notes: e.target.value });
                                } else {
                                  updateBulkAttendance(student.id, 'notes', e.target.value);
                                }
                              }}
                              placeholder="Escriba observaciones sobre el día del estudiante..."
                              rows={2}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                color: '#333',
                                backgroundColor: existingAttendance ? '#f0fdf4' : 'white',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                              }}
                            />
                          </div>
                      </div>
                    );
                  })}
                  </div>
                )}

                {students.length > 0 && students.some(s => !getAttendanceForStudent(s.id)) && (
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Guardando...' : 'Marcar Asistencia'}
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
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
                  value={historyStartDate}
                  onChange={(e) => handleHistoryStartDateChange(e.target.value)}
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
                  value={historyEndDate}
                  min={historyStartDate}
                  onChange={(e) => setHistoryEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
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

            {!loading && (
              <div>
                {historyAttendances.length === 0 ? (
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
                    {historyAttendances.map((attendance) => (
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
                            ...getHistoryStatusStyle(attendance.status)
                          }}>
                            {historyAttendanceStatuses.find(s => s.value === attendance.status)?.label}
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
                              <span>{foodOptionsHistory.find(f => f.value === attendance.ate)?.emoji || '🍪'}</span>
                              <span style={{
                                color: foodOptionsHistory.find(f => f.value === attendance.ate)?.color || '#666',
                                fontWeight: '500'
                              }}>
                                {foodOptionsHistory.find(f => f.value === attendance.ate)?.label || 'Snack'}
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
                              <span>{sleepOptionsHistory.find(s => s.value === attendance.slept)?.emoji || '🍽️'}</span>
                              <span style={{
                                color: sleepOptionsHistory.find(s => s.value === attendance.slept)?.color || '#666',
                                fontWeight: '500'
                              }}>
                                {sleepOptionsHistory.find(s => s.value === attendance.slept)?.label || 'Almuerzo'}
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
                              <span>{participationOptionsHistory.find(a => a.value === attendance.participatedInActivities)?.emoji || '✅'}</span>
                              <span style={{
                                color: participationOptionsHistory.find(a => a.value === attendance.participatedInActivities)?.color || '#666',
                                fontWeight: '500'
                              }}>
                                {participationOptionsHistory.find(a => a.value === attendance.participatedInActivities)?.label || 'Micción'}
                              </span>
                            </div>
                          )}
                          {attendance.defecation && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              backgroundColor: '#f9fafb'
                            }}>
                              <span>{attendance.defecation === 'yes' ? '✅' : '❌'}</span>
                              <span style={{
                                color: attendance.defecation === 'yes' ? '#22c55e' : '#ef4444',
                                fontWeight: '500'
                              }}>
                                {attendance.defecation === 'yes' ? 'Sí defecó' : 'No defecó'}
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
                                {moodOptions.find(m => m.value === attendance.mood)?.label || 'Ánimo'}
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

                        {attendance.createdAt && (
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
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;