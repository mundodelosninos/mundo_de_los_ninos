'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

interface Event {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  participants?: any[];
  googleEventId?: string;
  outlookEventId?: string;
}

interface UpcomingEventsProps {
  userRole: string;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  class: '📚',
  meal: '🍽️',
  nap: '😴',
  activity: '🎨',
  meeting: '👥',
  event: '📅',
  holiday: '🎉',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  class: '#3b82f6',
  meal: '#10b981',
  nap: '#8b5cf6',
  activity: '#f59e0b',
  meeting: '#ef4444',
  event: '#06b6d4',
  holiday: '#ec4899',
};

export default function UpcomingEvents({ userRole }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncingGoogle, setSyncingGoogle] = useState<string | null>(null);
  const [syncingOutlook, setSyncingOutlook] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [outlookToken, setOutlookToken] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
    // Check for tokens in localStorage
    const gToken = localStorage.getItem('googleCalendarToken');
    const oToken = localStorage.getItem('outlookCalendarToken');
    if (gToken) setGoogleToken(gToken);
    if (oToken) setOutlookToken(oToken);
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('calendar/upcoming?limit=10'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError('Error al cargar eventos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('calendar/auth/google/url'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (err) {
      setError('Error conectando con Google Calendar');
    }
  };

  const connectOutlookCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('calendar/auth/outlook/url'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (err) {
      setError('Error conectando con Outlook Calendar');
    }
  };

  const syncToGoogle = async (eventId: string) => {
    if (!googleToken) {
      setError('Primero debes conectar con Google Calendar');
      return;
    }

    setSyncingGoogle(eventId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`calendar/events/${eventId}/sync/google`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: googleToken }),
      });

      if (response.ok) {
        await fetchUpcomingEvents();
      } else {
        setError('Error sincronizando con Google Calendar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSyncingGoogle(null);
    }
  };

  const syncToOutlook = async (eventId: string) => {
    if (!outlookToken) {
      setError('Primero debes conectar con Outlook Calendar');
      return;
    }

    setSyncingOutlook(eventId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`calendar/events/${eventId}/sync/outlook`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: outlookToken }),
      });

      if (response.ok) {
        await fetchUpcomingEvents();
      } else {
        setError('Error sincronizando con Outlook Calendar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSyncingOutlook(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando eventos próximos...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#333', margin: 0, fontSize: '1rem' }}>
          📅 Próximos Eventos
        </h2>

        {(userRole === 'admin' || userRole === 'teacher') && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!googleToken && (
              <button
                onClick={connectGoogleCalendar}
                style={{
                  backgroundColor: '#4285f4',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                🔗 Google Calendar
              </button>
            )}
            {!outlookToken && (
              <button
                onClick={connectOutlookCalendar}
                style={{
                  backgroundColor: '#0078d4',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                🔗 Outlook Calendar
              </button>
            )}
          </div>
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

      {events.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          No hay eventos próximos
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${EVENT_TYPE_COLORS[event.type] || '#3b82f6'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{EVENT_TYPE_ICONS[event.type] || '📅'}</span>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>{event.title}</h3>
                  </div>

                  {event.description && (
                    <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666', fontSize: '0.85rem' }}>
                      <span>📅</span>
                      <span>{formatDate(event.startDate)}</span>
                    </div>

                    {!event.allDay && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666', fontSize: '0.85rem' }}>
                        <span>🕐</span>
                        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                    )}

                    {event.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#666', fontSize: '0.85rem' }}>
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#999' }}>
                    Creado por: {event.createdBy.firstName} {event.createdBy.lastName}
                  </div>
                </div>

                {(userRole === 'admin' || userRole === 'teacher') && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    {googleToken && !event.googleEventId && (
                      <button
                        onClick={() => syncToGoogle(event.id)}
                        disabled={syncingGoogle === event.id}
                        style={{
                          backgroundColor: syncingGoogle === event.id ? '#ccc' : '#4285f4',
                          color: 'white',
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: syncingGoogle === event.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Sincronizar con Google Calendar"
                      >
                        {syncingGoogle === event.id ? '⏳' : 'G'}
                      </button>
                    )}
                    {event.googleEventId && (
                      <span style={{ padding: '0.5rem', color: '#4285f4', fontSize: '0.8rem' }} title="Sincronizado con Google">✓ G</span>
                    )}

                    {outlookToken && !event.outlookEventId && (
                      <button
                        onClick={() => syncToOutlook(event.id)}
                        disabled={syncingOutlook === event.id}
                        style={{
                          backgroundColor: syncingOutlook === event.id ? '#ccc' : '#0078d4',
                          color: 'white',
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: syncingOutlook === event.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Sincronizar con Outlook Calendar"
                      >
                        {syncingOutlook === event.id ? '⏳' : 'O'}
                      </button>
                    )}
                    {event.outlookEventId && (
                      <span style={{ padding: '0.5rem', color: '#0078d4', fontSize: '0.8rem' }} title="Sincronizado con Outlook">✓ O</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
