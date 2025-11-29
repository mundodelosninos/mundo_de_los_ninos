'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nextBirthday: string;
  daysUntilBirthday: number;
  turningAge: number;
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

interface BirthdayAlertsProps {
  daysAhead?: number;
}

export default function BirthdayAlerts({ daysAhead = 14 }: BirthdayAlertsProps) {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUpcomingBirthdays();
  }, [daysAhead]);

  const fetchUpcomingBirthdays = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`students/upcoming-birthdays?days=${daysAhead}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUpcomingBirthdays(data);
      } else {
        setError('Error al cargar cumpleaños próximos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  const getBirthdayIcon = (daysUntil: number) => {
    if (daysUntil === 0) return '🎂';
    if (daysUntil <= 3) return '🎉';
    if (daysUntil <= 7) return '🎈';
    return '🎁';
  };

  const getBirthdayMessage = (daysUntil: number, firstName: string) => {
    if (daysUntil === 0) return `¡Hoy es el cumpleaños de ${firstName}!`;
    if (daysUntil === 1) return `¡Mañana es el cumpleaños de ${firstName}!`;
    return `Cumpleaños de ${firstName} en ${daysUntil} días`;
  };

  const getPriorityColor = (daysUntil: number) => {
    if (daysUntil === 0) return '#dc2626'; // red
    if (daysUntil <= 3) return '#ea580c'; // orange
    if (daysUntil <= 7) return '#d97706'; // amber
    return '#2563eb'; // blue
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem'
      }}>
        <div style={{ color: '#666' }}>Cargando cumpleaños...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem'
      }}>
        <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>
      </div>
    );
  }

  if (upcomingBirthdays.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          🎂 Próximos Cumpleaños
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          No hay cumpleaños en los próximos {daysAhead} días.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#333', margin: 0, fontSize: '1rem' }}>
          🎂 Próximos Cumpleaños
        </h2>
      </div>

      {upcomingBirthdays.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          No hay cumpleaños en los próximos {daysAhead} días
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {upcomingBirthdays.map((student) => (
            <div
              key={student.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getPriorityColor(student.daysUntilBirthday)}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }} role="img" aria-label="birthday">
                      {getBirthdayIcon(student.daysUntilBirthday)}
                    </span>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
                      {student.firstName} {student.lastName}
                    </h3>
                  </div>

                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    {getBirthdayMessage(student.daysUntilBirthday, student.firstName)}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666', fontSize: '0.85rem' }}>
                      <span>📅</span>
                      <span>{formatDate(student.nextBirthday)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666', fontSize: '0.85rem' }}>
                      <span>🎈</span>
                      <span>Cumplirá {student.turningAge} años</span>
                    </div>
                  </div>
                </div>

                {student.daysUntilBirthday === 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    marginLeft: '1rem'
                  }}>
                    ¡HOY!
                  </span>
                )}
                {student.daysUntilBirthday === 1 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: '#ffedd5',
                    color: '#9a3412',
                    marginLeft: '1rem'
                  }}>
                    MAÑANA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
