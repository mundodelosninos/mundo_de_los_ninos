'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfDay, endOfDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
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
    firstName: string;
    lastName: string;
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

interface ModernCalendarProps {
  userRole: string;
}

const EVENT_TYPES = {
  class: { label: 'Clase', icon: '📚', color: '#3b82f6', bgColor: '#dbeafe' },
  meal: { label: 'Comida', icon: '🍽️', color: '#10b981', bgColor: '#d1fae5' },
  nap: { label: 'Siesta', icon: '😴', color: '#8b5cf6', bgColor: '#ede9fe' },
  activity: { label: 'Actividad', icon: '🎨', color: '#f59e0b', bgColor: '#fef3c7' },
  meeting: { label: 'Reunión', icon: '👥', color: '#ef4444', bgColor: '#fee2e2' },
  event: { label: 'Evento', icon: '📅', color: '#06b6d4', bgColor: '#cffafe' },
  holiday: { label: 'Feriado', icon: '🎉', color: '#ec4899', bgColor: '#fce7f3' },
};

export default function ModernCalendar({ userRole }: ModernCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [participantMode, setParticipantMode] = useState<'individual' | 'group' | 'all'>('individual');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [quickEvent, setQuickEvent] = useState({
    title: '',
    type: 'event',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchStudents();
    fetchGroups();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await fetch(
        getApiUrl(`calendar/events?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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

  const handleQuickAdd = async () => {
    if (!quickEvent.title || !quickAddDate) return;

    try {
      const token = localStorage.getItem('token');
      const [startHour, startMin] = quickEvent.startTime.split(':');
      const [endHour, endMin] = quickEvent.endTime.split(':');

      const startDate = new Date(quickAddDate);
      startDate.setHours(parseInt(startHour), parseInt(startMin));

      const endDate = new Date(quickAddDate);
      endDate.setHours(parseInt(endHour), parseInt(endMin));

      const eventData: any = {
        title: quickEvent.title,
        description: quickEvent.description,
        type: quickEvent.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        allDay: false,
      };

      // Add participants based on mode
      if (participantMode === 'all') {
        eventData.studentIds = students.map(s => s.id);
      } else if (participantMode === 'group') {
        eventData.groupIds = selectedGroups;
      } else if (participantMode === 'individual') {
        eventData.studentIds = selectedStudents;
      }

      const url = editingEvent
        ? getApiUrl(`calendar/events/${editingEvent.id}`)
        : getApiUrl('calendar/events');

      const response = await fetch(url, {
        method: editingEvent ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setShowQuickAdd(false);
        setQuickEvent({ title: '', type: 'event', startTime: '09:00', endTime: '10:00', description: '' });
        setSelectedStudents([]);
        setSelectedGroups([]);
        setParticipantMode('individual');
        setEditingEvent(null);
        fetchEvents();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Error: ${errorData.message || 'No se pudo guardar el evento'}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error de conexión al guardar el evento');
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`calendar/events/${editingEvent.id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowQuickAdd(false);
        setQuickEvent({ title: '', type: 'event', startTime: '09:00', endTime: '10:00', description: '' });
        setSelectedStudents([]);
        setSelectedGroups([]);
        setParticipantMode('individual');
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDayClick = (day: Date) => {
    if (userRole === 'admin' || userRole === 'teacher') {
      setQuickAddDate(day);
      setEditingEvent(null);
      setShowQuickAdd(true);
    }
    setSelectedDate(day);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole === 'admin' || userRole === 'teacher') {
      setEditingEvent(event);
      setQuickAddDate(new Date(event.startDate));
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      setQuickEvent({
        title: event.title,
        type: event.type,
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        description: event.description || '',
      });
      setShowQuickAdd(true);
    } else if (userRole === 'parent') {
      setViewingEvent(event);
    }
  };

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), day));
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    // Use weekStartsOn: 0 to start on Sunday
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = new Date(day);
      const dayEvents = getEventsForDay(currentDay);
      const isCurrentMonth = isSameMonth(currentDay, monthStart);
      const isCurrentDay = isToday(currentDay);
      const dayName = format(currentDay, 'EEEE', { locale: es });

      days.push(
        <div
          key={day.toString()}
          onClick={() => handleDayClick(currentDay)}
          style={{
            minHeight: '130px',
            padding: '12px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: !isCurrentMonth ? '#f9fafb' : '#ffffff',
            opacity: !isCurrentMonth ? 0.6 : 1,
            ...(isCurrentDay && {
              border: '2px solid #3b82f6',
              backgroundColor: '#eff6ff',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            }),
            ...(selectedDate && isSameDay(currentDay, selectedDate) && {
              border: '2px solid #8b5cf6',
              boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
            }),
          }}
          onMouseEnter={(e) => {
            if (isCurrentMonth && !isCurrentDay) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (isCurrentMonth && !isCurrentDay) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: isCurrentDay ? '#3b82f6' : '#111827',
              marginBottom: '2px'
            }}>
              {format(currentDay, 'd')}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '500',
              color: '#6b7280',
              textTransform: 'capitalize'
            }}>
              {dayName}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {dayEvents.slice(0, 3).map(event => {
              const eventType = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.event;
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: eventType.bgColor,
                    color: eventType.color,
                    fontWeight: '600',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                  title={event.title}
                >
                  {eventType.icon} {event.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div style={{
                fontSize: '11px',
                color: '#3b82f6',
                fontWeight: '600',
                paddingLeft: '8px'
              }}>
                +{dayEvents.length - 3} más
              </div>
            )}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDay(day);
      const isCurrentDay = isToday(day);

      days.push(
        <div key={day.toString()} style={{ borderRight: i < 6 ? '1px solid #e5e7eb' : 'none' }}>
          <div style={{
            padding: '12px',
            backgroundColor: isCurrentDay ? '#eff6ff' : '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              {format(day, 'EEE', { locale: es })}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: isCurrentDay ? '#3b82f6' : '#111827'
            }}>
              {format(day, 'd')}
            </div>
          </div>

          <div style={{ padding: '12px', minHeight: '400px', backgroundColor: '#ffffff' }}>
            {dayEvents.map(event => {
              const eventType = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.event;
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  style={{
                    padding: '8px 12px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    backgroundColor: eventType.bgColor,
                    borderLeft: `3px solid ${eventType.color}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: eventType.color,
                    marginBottom: '4px'
                  }}>
                    {eventType.icon} {event.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderListView = () => {
    const upcomingEvents = getUpcomingEvents();

    if (upcomingEvents.length === 0) {
      return (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          No hay eventos próximos
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {upcomingEvents.map(event => {
          const eventType = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.event;
          const eventDate = new Date(event.startDate);

          return (
            <div
              key={event.id}
              onClick={(e) => handleEventClick(event, e)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                border: `2px solid ${eventType.bgColor}`,
                borderLeft: `4px solid ${eventType.color}`,
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: '80px',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: eventType.bgColor,
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: eventType.color,
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    {format(eventDate, 'MMM', { locale: es })}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: eventType.color
                  }}>
                    {format(eventDate, 'd')}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: eventType.color,
                    textTransform: 'capitalize'
                  }}>
                    {format(eventDate, 'EEEE', { locale: es })}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{eventType.icon}</span>
                    {event.title}
                  </div>

                  {event.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 8px 0'
                    }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🕐</span>
                      {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                    </div>
                    {event.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📍</span>
                        {event.location}
                      </div>
                    )}
                  </div>

                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    Creado por: {event.createdBy.firstName} {event.createdBy.lastName}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const canCreateEvents = userRole === 'admin' || userRole === 'teacher';

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    }
  };

  const getViewTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: es });
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
    } else {
      return 'Próximos Eventos';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 3vw, 1.5rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }} className="calendar-header-nav">
          {viewMode !== 'list' && (
            <>
              <button
                onClick={() => handleNavigate('prev')}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  fontWeight: '600',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                ←
              </button>
            </>
          )}

          <h2 style={{
            fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
            fontWeight: 'bold',
            textTransform: 'capitalize',
            color: '#333',
            margin: 0,
            flex: '1 1 auto',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            {getViewTitle()}
          </h2>

          {viewMode !== 'list' && (
            <>
              <button
                onClick={() => handleNavigate('next')}
                style={{
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  fontWeight: '600',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                →
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                style={{
                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: '600',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Hoy
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 0.75rem)', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }} className="calendar-controls">
          {/* View Mode Selector */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'month' ? '#ffffff' : 'transparent',
                color: viewMode === 'month' ? '#111827' : '#6b7280',
                boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'week' ? '#ffffff' : 'transparent',
                color: viewMode === 'week' ? '#111827' : '#6b7280',
                boxShadow: viewMode === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#111827' : '#6b7280',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Lista
            </button>
          </div>

          {canCreateEvents && (
            <button
              onClick={() => {
                setQuickAddDate(new Date());
                setShowQuickAdd(true);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '18px' }}>+</span>
              Nuevo Evento
            </button>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {viewMode === 'month' && (
          <>
            {/* Day Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '2px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                <div
                  key={day}
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Cargando eventos...</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)'
              }}>
                {renderMonthView()}
              </div>
            )}
          </>
        )}

        {viewMode === 'week' && (
          <>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Cargando eventos...</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)'
              }}>
                {renderWeekView()}
              </div>
            )}
          </>
        )}

        {viewMode === 'list' && (
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Cargando eventos...</p>
              </div>
            ) : (
              renderListView()
            )}
          </div>
        )}
      </div>

      {/* Quick Add Modal - RESPONSIVE POPUP */}
      {showQuickAdd && quickAddDate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
          }}
          onClick={() => setShowQuickAdd(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '95vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideUp 0.3s ease-out',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#333',
                  margin: '0 0 8px 0'
                }}>
                  {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {format(quickAddDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  setEditingEvent(null);
                  setQuickEvent({ title: '', type: 'event', startTime: '09:00', endTime: '10:00', description: '' });
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Título del evento *
                </label>
                <input
                  type="text"
                  value={quickEvent.title}
                  onChange={(e) => setQuickEvent({ ...quickEvent, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Ej: Clase de Arte"
                  autoFocus
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Tipo de evento
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px'
                }}>
                  {Object.entries(EVENT_TYPES).map(([key, { label, icon, color, bgColor }]) => (
                    <button
                      key={key}
                      onClick={() => setQuickEvent({ ...quickEvent, type: key })}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `2px solid ${quickEvent.type === key ? color : '#e5e7eb'}`,
                        backgroundColor: quickEvent.type === key ? bgColor : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: quickEvent.type === key ? color : '#374151',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={(e) => {
                        if (quickEvent.type !== key) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (quickEvent.type !== key) {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={quickEvent.startTime}
                    onChange={(e) => {
                      const newStartTime = e.target.value;
                      const [startHour, startMin] = newStartTime.split(':').map(Number);
                      const [endHour, endMin] = quickEvent.endTime.split(':').map(Number);

                      // Calculate if end time needs to be updated
                      const startMinutes = startHour * 60 + startMin;
                      const endMinutes = endHour * 60 + endMin;

                      let newEndTime = quickEvent.endTime;
                      if (startMinutes >= endMinutes) {
                        // Set end time to 1 hour after start time
                        const newEndMinutes = startMinutes + 60;
                        const newEndHour = Math.floor(newEndMinutes / 60) % 24;
                        const newEndMin = newEndMinutes % 60;
                        newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMin).padStart(2, '0')}`;
                      }

                      setQuickEvent({ ...quickEvent, startTime: newStartTime, endTime: newEndTime });
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={quickEvent.endTime}
                    min={quickEvent.startTime}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      const [startHour, startMin] = quickEvent.startTime.split(':').map(Number);
                      const [endHour, endMin] = newEndTime.split(':').map(Number);

                      const startMinutes = startHour * 60 + startMin;
                      const endMinutes = endHour * 60 + endMin;

                      // Only update if end time is after start time
                      if (endMinutes > startMinutes) {
                        setQuickEvent({ ...quickEvent, endTime: newEndTime });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Participant Selection */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Participantes
                </label>

                {/* Mode Selection */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => setParticipantMode('individual')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${participantMode === 'individual' ? '#3b82f6' : '#e5e7eb'}`,
                      backgroundColor: participantMode === 'individual' ? '#eff6ff' : '#ffffff',
                      color: participantMode === 'individual' ? '#3b82f6' : '#374151',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    👤 Individual
                  </button>
                  <button
                    onClick={() => setParticipantMode('group')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${participantMode === 'group' ? '#10b981' : '#e5e7eb'}`,
                      backgroundColor: participantMode === 'group' ? '#d1fae5' : '#ffffff',
                      color: participantMode === 'group' ? '#10b981' : '#374151',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    👥 Por Grupo
                  </button>
                  <button
                    onClick={() => setParticipantMode('all')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${participantMode === 'all' ? '#8b5cf6' : '#e5e7eb'}`,
                      backgroundColor: participantMode === 'all' ? '#ede9fe' : '#ffffff',
                      color: participantMode === 'all' ? '#8b5cf6' : '#374151',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ✨ Todos
                  </button>
                </div>

                {/* Individual Students */}
                {participantMode === 'individual' && (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {students.map(student => (
                      <label
                        key={student.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          backgroundColor: selectedStudents.includes(student.id) ? '#eff6ff' : '#ffffff',
                          border: `1px solid ${selectedStudents.includes(student.id) ? '#3b82f6' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedStudents.includes(student.id)) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedStudents.includes(student.id)) {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          {student.firstName} {student.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Groups */}
                {participantMode === 'group' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {groups.map(group => (
                      <label
                        key={group.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          backgroundColor: selectedGroups.includes(group.id) ? '#d1fae5' : '#ffffff',
                          border: `1px solid ${selectedGroups.includes(group.id) ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedGroups.includes(group.id)) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedGroups.includes(group.id)) {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => toggleGroup(group.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: group.color,
                        }}></div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          {group.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* All Students */}
                {participantMode === 'all' && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#ede9fe',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#8b5cf6'
                    }}>
                      ✨ Todos los estudiantes ({students.length}) serán añadidos a este evento
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Descripción (opcional)
                </label>
                <textarea
                  value={quickEvent.description}
                  onChange={(e) => setQuickEvent({ ...quickEvent, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Detalles adicionales del evento..."
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setEditingEvent(null);
                    setQuickEvent({ title: '', type: 'event', startTime: '09:00', endTime: '10:00', description: '' });
                  }}
                  style={{
                    flex: '1 1 140px',
                    padding: '12px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  Cancelar
                </button>
                {editingEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    style={{
                      flex: '1 1 140px',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 6px 8px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.2)';
                    }}
                  >
                    Eliminar
                  </button>
                )}
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickEvent.title}
                  style={{
                    flex: '1 1 140px',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: quickEvent.title ? '#3b82f6' : '#d1d5db',
                    color: '#ffffff',
                    cursor: quickEvent.title ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    boxShadow: quickEvent.title ? '0 4px 6px rgba(59, 130, 246, 0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (quickEvent.title) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 6px 8px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (quickEvent.title) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)';
                    }
                  }}
                >
                  {editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal (Read-only for Parents) */}
      {viewingEvent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
          }}
          onClick={() => setViewingEvent(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px' }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '32px' }}>
                      {EVENT_TYPES[viewingEvent.type as keyof typeof EVENT_TYPES]?.icon || '📅'}
                    </span>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#333',
                      margin: 0
                    }}>
                      {viewingEvent.title}
                    </h3>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    backgroundColor: EVENT_TYPES[viewingEvent.type as keyof typeof EVENT_TYPES]?.bgColor || '#e5e7eb',
                    color: EVENT_TYPES[viewingEvent.type as keyof typeof EVENT_TYPES]?.color || '#374151',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {EVENT_TYPES[viewingEvent.type as keyof typeof EVENT_TYPES]?.label || 'Evento'}
                  </div>
                </div>
                <button
                  onClick={() => setViewingEvent(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              {viewingEvent.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    Descripción
                  </h4>
                  <p style={{
                    fontSize: '15px',
                    color: '#374151',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {viewingEvent.description}
                  </p>
                </div>
              )}

              {/* Event Details */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px'
                }}>
                  Detalles
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      📅
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Fecha</div>
                      <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                        {format(new Date(viewingEvent.startDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  {!viewingEvent.allDay && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        🕐
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Horario</div>
                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                          {format(new Date(viewingEvent.startDate), 'HH:mm')} - {format(new Date(viewingEvent.endDate), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {viewingEvent.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        📍
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Ubicación</div>
                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                          {viewingEvent.location}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Created By */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#fce7f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Creado por</div>
                      <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                        {viewingEvent.createdBy.firstName} {viewingEvent.createdBy.lastName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setViewingEvent(null)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 6px 8px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)';
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .calendar-header-nav {
            flex-direction: column;
            align-items: stretch !important;
            text-align: center;
          }

          .calendar-header-nav h2 {
            order: -1;
            margin-bottom: 0.75rem;
          }

          .calendar-header-nav button {
            font-size: 14px !important;
          }

          .calendar-controls {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          /* On very small screens, recommend list view */
          :global(.day-headers) {
            font-size: 10px !important;
            padding: 8px 4px !important;
          }
        }
      `}</style>
    </div>
  );
}
