'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { getApiUrl, getSocketUrl } from '@/config/api';
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import GroupManagement from './components/GroupManagement';
import AttendanceManagement from './components/AttendanceManagement';
import ActivityManagement from './components/ActivityManagement';
import ChatManagement from './components/ChatManagement';
import { CalendarView } from '@/components/calendar/CalendarView';
import UpcomingEvents from '@/components/calendar/UpcomingEvents';
import ModernCalendar from '@/components/calendar/ModernCalendar';
import UserSettings from './components/UserSettings';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import BirthdayAlerts from './components/BirthdayAlerts';
import MediaManagement from './components/MediaManagement';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
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
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [stats, setStats] = useState({
    students: 0,
    groups: 0,
    messages: 0,
    activities: 0
  });
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync activeTab with URL parameter
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'overview';
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!storedToken || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setToken(storedToken);
    } catch (error) {
      localStorage.clear();
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (token && user) {
      fetchStats();
      fetchUpcomingActivities();
    }
  }, [token, user, activeTab]);

  // Initialize Socket.io for real-time unread message count updates
  useEffect(() => {
    if (token && user) {
      const newSocket = io(getSocketUrl('chat'), {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Dashboard connected to chat server for unread count updates');
      });

      newSocket.on('new_message', async (message: any) => {
        // Only update count if the message is not from the current user
        if (message.sender?.id !== user.id) {
          // Refetch unread count when a new message arrives
          try {
            const unreadRes = await fetch(getApiUrl('chat/unread-count'), {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (unreadRes.ok) {
              const unreadData = await unreadRes.json();
              setStats(prev => ({
                ...prev,
                messages: unreadData.unreadCount,
              }));
            }
          } catch (error) {
            console.error('Error fetching unread count:', error);
          }
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, user]);

  const fetchStats = async () => {
    try {
      const [studentsRes, groupsRes, unreadRes] = await Promise.all([
        fetch(getApiUrl('students'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(getApiUrl('groups'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(getApiUrl('chat/unread-count'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (studentsRes.ok && groupsRes.ok) {
        const students = await studentsRes.json();
        const groups = await groupsRes.json();
        const unreadData = unreadRes.ok ? await unreadRes.json() : { unreadCount: 0 };

        setStats({
          students: students.length,
          groups: groups.length,
          messages: unreadData.unreadCount,
          activities: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUpcomingActivities = async () => {
    try {
      // Fetch all activities without date filtering to avoid timezone issues
      const response = await fetch(getApiUrl('attendance/activities'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();

        // Get start of today in local time (00:00:00)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        console.log('Dashboard - Today start (local):', todayStart);
        console.log('Dashboard - Total activities:', data.length);

        // Filter for activities from today onwards (not strictly future, to account for timezone issues)
        // and sort by start time
        const upcoming = data
          .filter((activity: Activity) => {
            const activityStart = new Date(activity.startTime);
            const isUpcoming = activityStart >= todayStart;
            console.log('Activity:', activity.title, 'Start:', activity.startTime, 'Parsed:', activityStart, 'IsUpcoming:', isUpcoming);
            return isUpcoming;
          })
          .sort((a: Activity, b: Activity) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          .slice(0, 5); // Show only the next 5

        console.log('Dashboard - Upcoming activities:', upcoming.length);
        setUpcomingActivities(upcoming);

        // Update the activities counter in stats
        setStats(prev => ({ ...prev, activities: upcoming.length }));
      }
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
    }
  };

  const getActivityTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      meal: '🍽️',
      nap: '😴',
      play: '🎯',
      learning: '📚',
      outdoor: '🌳',
      art: '🎨',
      music: '🎵',
      other: '📝',
    };
    return icons[type] || '📋';
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((activityDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((activityDate.getTime() - now.getTime()) / (1000 * 60));
      return `En ${diffInMinutes} minutos`;
    }
    if (diffInHours < 24) {
      return `En ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    }
    if (diffInDays === 1) {
      return 'Mañana';
    }
    return `En ${diffInDays} días`;
  };

  // Group activities by batch (similar to ActivityManagement component)
  const groupActivitiesByBatch = (activities: Activity[]) => {
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

    // Convert batched object to array and combine with individual activities
    const groupedActivities: Array<{ type: 'batch' | 'individual', activities: Activity[], batchId?: string }> = [];

    // Add batched activities
    Object.entries(batched).forEach(([batchId, activities]) => {
      groupedActivities.push({ type: 'batch', activities, batchId });
    });

    // Add individual activities
    individual.forEach(activity => {
      groupedActivities.push({ type: 'individual', activities: [activity] });
    });

    // Sort by earliest activity start time in each group
    groupedActivities.sort((a, b) => {
      const aStartTime = new Date(a.activities[0].startTime).getTime();
      const bStartTime = new Date(b.activities[0].startTime).getTime();
      return aStartTime - bStartTime;
    });

    return groupedActivities;
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handlePasswordChanged = () => {
    setShowPasswordChangeModal(false);
    // Actualizar el estado del usuario
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  const getNavItems = (userRole: string) => {
    const baseItems = [
      { id: 'overview', label: '📊 Resumen', icon: '📊' },
    ];

    const adminItems = [
      { id: 'students', label: '👶 Directorio', icon: '👶' },
      { id: 'teachers', label: '👩‍🏫 Gestión de Maestros', icon: '👩‍🏫' },
      { id: 'groups', label: '👥 Gestión de Grupos', icon: '👥' },
      { id: 'attendance', label: '📝 Asistencia', icon: '📝' },
      { id: 'activities', label: '🎯 Actividades', icon: '🎯' },
      { id: 'media', label: '📷 Fotos y Documentos', icon: '📷' },
      { id: 'calendar', label: '📅 Calendario', icon: '📅' },
      { id: 'chat', label: '💬 Mensajes', icon: '💬' },
      // { id: 'reports', label: '📈 Reportes', icon: '📈' },
    ];

    const teacherItems = [
      { id: 'students', label: '👶 Mis Estudiantes', icon: '👶' },
      { id: 'groups', label: '👥 Mis Grupos', icon: '👥' },
      { id: 'attendance', label: '📝 Asistencia', icon: '📝' },
      { id: 'activities', label: '🎯 Actividades', icon: '🎯' },
      { id: 'media', label: '📷 Fotos y Documentos', icon: '📷' },
      { id: 'calendar', label: '📅 Calendario', icon: '📅' },
      { id: 'chat', label: '💬 Mensajes', icon: '💬' },
    ];

    const parentItems = [
      { id: 'children', label: '👶 Mis Hijos', icon: '👶' },
      { id: 'groups', label: '👥 Grupos de Mis Hijos', icon: '👥' },
      { id: 'attendance', label: '📊 Asistencia', icon: '📊' },
      { id: 'media', label: '📷 Fotos y Documentos', icon: '📷' },
      { id: 'calendar', label: '📅 Calendario', icon: '📅' },
      { id: 'chat', label: '💬 Mensajes', icon: '💬' },
    ];

    let roleItems: Array<{ id: string; label: string; icon: string }> = [];
    switch (userRole) {
      case 'admin':
        roleItems = adminItems;
        break;
      case 'teacher':
        roleItems = teacherItems;
        break;
      case 'parent':
        roleItems = parentItems;
        break;
      default:
        roleItems = [];
    }

    return [
      ...baseItems,
      ...roleItems,
      { id: 'settings', label: '⚙️ Configuración', icon: '⚙️' },
    ];
  };

  const navItems = getNavItems(user?.role || '');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h2 style={{
              color: '#333',
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
            }}>
              📊 Panel de Control - {user?.role === 'admin' ? 'Administrador' : user?.role === 'teacher' ? 'Maestro' : 'Padre de Familia'}
            </h2>

            {/* Mensaje de bienvenida personalizado */}
            <div style={{
              backgroundColor: '#e0f2fe',
              padding: 'clamp(0.75rem, 2vw, 1rem)',
              borderRadius: '10px',
              marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
              border: '1px solid #0284c7'
            }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                color: '#0284c7',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)'
              }}>
                ¡Bienvenido, {user?.firstName}!
              </h3>
              <p style={{
                margin: 0,
                color: '#0369a1',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                lineHeight: '1.5'
              }}>
                {user?.role === 'admin' && 'Tienes acceso completo al sistema para gestionar estudiantes, maestros y configuraciones.'}
                {user?.role === 'teacher' && 'Puedes gestionar tus grupos, ver estudiantes y comunicarte con los padres.'}
                {user?.role === 'parent' && 'Puedes ver la información de tus hijos y comunicarte con sus maestros.'}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              marginBottom: 'clamp(1.5rem, 3vw, 2rem)'
            }}>
              {/* Estudiantes/Hijos */}
              <div style={{
                backgroundColor: 'white',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: '#3b82f6',
                  fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)'
                }}>
                  👶 {user?.role === 'parent' ? 'Mis Hijos' : 'Estudiantes'}
                </h3>
                <p style={{
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#333'
                }}>
                  {stats.students}
                </p>
                <p style={{
                  fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                  color: '#666',
                  margin: '0.25rem 0 0 0'
                }}>
                  {user?.role === 'parent' ? 'Registrados' : 'Total registrados'}
                </p>
              </div>

              {/* Grupos */}
              <div style={{
                backgroundColor: 'white',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: '#10b981',
                  fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)'
                }}>
                  👥 {user?.role === 'parent' ? 'Grupos' : user?.role === 'teacher' ? 'Mis Grupos' : 'Grupos'}
                </h3>
                <p style={{
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#333'
                }}>
                  {stats.groups}
                </p>
                <p style={{
                  fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                  color: '#666',
                  margin: '0.25rem 0 0 0'
                }}>
                  {user?.role === 'teacher' ? 'Asignados' : 'Total'}
                </p>
              </div>

              {/* Mensajes */}
              <div style={{
                backgroundColor: 'white',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: '#f59e0b',
                  fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)'
                }}>
                  💬 Mensajes
                </h3>
                <p style={{
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#333'
                }}>
                  {stats.messages}
                </p>
                <p style={{
                  fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                  color: '#666',
                  margin: '0.25rem 0 0 0'
                }}>
                  Sin leer
                </p>
              </div>
            </div>

            {/* Birthday Alerts, Upcoming Events, and Upcoming Activities Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
              marginBottom: 'clamp(1.5rem, 3vw, 2rem)'
            }}>
              <BirthdayAlerts daysAhead={14} />
              <UpcomingEvents userRole={user?.role || ''} />

              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#333', margin: 0, fontSize: '1rem' }}>
                    📋 Próximas Actividades
                  </h2>
                </div>

                {upcomingActivities.length === 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#666',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}>
                    No hay actividades programadas para los próximos días
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {groupActivitiesByBatch(upcomingActivities).slice(0, 5).map((group, idx) => {
                      const firstActivity = group.activities[0];

                      if (group.type === 'batch') {
                        // Render batch activities
                        return (
                          <div
                            key={group.batchId || idx}
                            style={{
                              backgroundColor: 'white',
                              borderRadius: '10px',
                              padding: '1.5rem',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                              borderLeft: `4px solid #3b82f6`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {getActivityTypeIcon(firstActivity.type)}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <strong style={{ fontSize: '0.95rem', color: '#333' }}>
                                    {firstActivity.title}
                                  </strong>
                                  <span style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    borderRadius: '20px',
                                    backgroundColor: '#dbeafe',
                                    color: '#1e40af'
                                  }}>
                                    👥 {group.activities.length} estudiantes
                                  </span>
                                </div>
                                {firstActivity.description && (
                                  <p style={{
                                    fontSize: '0.85rem',
                                    color: '#666',
                                    margin: '0.25rem 0 0 0'
                                  }}>
                                    {firstActivity.description}
                                  </p>
                                )}
                                <span style={{
                                  color: '#3b82f6',
                                  fontSize: '0.8rem',
                                  display: 'block',
                                  marginTop: '0.5rem',
                                  fontWeight: '500'
                                }}>
                                  {formatRelativeTime(firstActivity.startTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Render individual activity
                        return (
                          <div
                            key={firstActivity.id}
                            style={{
                              backgroundColor: 'white',
                              borderRadius: '10px',
                              padding: '1.5rem',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                              borderLeft: `4px solid #3b82f6`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {getActivityTypeIcon(firstActivity.type)}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div>
                                  <strong style={{ fontSize: '0.95rem', color: '#333' }}>
                                    {firstActivity.title}
                                  </strong>
                                  <span style={{ fontSize: '0.95rem', color: '#666' }}>
                                    {' '}para {firstActivity.student.firstName} {firstActivity.student.lastName}
                                  </span>
                                </div>
                                {firstActivity.description && (
                                  <p style={{
                                    fontSize: '0.85rem',
                                    color: '#666',
                                    margin: '0.25rem 0 0 0'
                                  }}>
                                    {firstActivity.description}
                                  </p>
                                )}
                                <span style={{
                                  color: '#3b82f6',
                                  fontSize: '0.8rem',
                                  display: 'block',
                                  marginTop: '0.25rem',
                                  fontWeight: '500'
                                }}>
                                  {formatRelativeTime(firstActivity.startTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'students':
        return <StudentManagement userRole={user?.role || ''} />;
      case 'children':
        return <StudentManagement userRole={user?.role || ''} />;
      case 'teachers':
        return <TeacherManagement userRole={user?.role || ''} />;
      case 'groups':
        return <GroupManagement userRole={user?.role || ''} />;
      case 'attendance':
        return <AttendanceManagement userRole={user?.role || ''} />;
      case 'activities':
        return <ActivityManagement userRole={user?.role || ''} />;
      case 'calendar':
        return <ModernCalendar userRole={user?.role || ''} />;
      case 'media':
        return <MediaManagement userRole={user?.role || ''} />;
      case 'chat':
        return <ChatManagement userRole={user?.role || ''} />;
      case 'reports':
        return (
          <div>
            <h2 style={{
              color: '#333',
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
            }}>
              📈 Reportes y Analytics
            </h2>
            <div style={{
              backgroundColor: 'white',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <p style={{
                color: '#666',
                textAlign: 'center',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
              }}>
                🚧 Módulo en desarrollo - Próximamente podrás ver reportes detallados
              </p>
            </div>
          </div>
        );
      case 'settings':
        return <UserSettings user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  return (
    <>
      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <PasswordChangeModal onPasswordChanged={handlePasswordChanged} />
      )}

      <div style={{ minHeight: '100vh', backgroundColor: '#f0f8ff' }}>
        {/* Mobile Header */}
        <div className="mobile-header" style={{
          display: 'block',
          backgroundColor: 'white',
          padding: '1rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ color: '#333', fontSize: 'clamp(1rem, 4vw, 1.2rem)', margin: 0 }}>
              🌟 Mundo de Niños
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <div style={{
            width: '250px',
            backgroundColor: 'white',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
            padding: '1rem',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            left: mobileMenuOpen ? 0 : '-100%',
            top: 0,
            zIndex: 100,
            transition: 'left 0.3s ease',
          }} className="sidebar-mobile">
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ color: '#333', fontSize: 'clamp(1rem, 3vw, 1.2rem)', margin: 0 }}>
                🌟 Mundo de Niños
              </h1>
              <p style={{ color: '#666', fontSize: 'clamp(0.75rem, 2vw, 0.8rem)', margin: '0.5rem 0' }}>
                Hola, {user.firstName}
              </p>
              <div style={{
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '0.3rem 0.6rem',
                borderRadius: '12px',
                fontSize: 'clamp(0.6rem, 1.5vw, 0.65rem)',
                marginTop: '0.5rem',
                display: 'inline-block'
              }}>
                ✅ Sistema Activo
              </div>
            </div>

            <nav>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                    // Update URL to create browser history entry
                    const newUrl = item.id === 'overview'
                      ? '/dashboard'
                      : `/dashboard?tab=${item.id}`;
                    window.history.pushState({}, '', newUrl);
                  }}
                  style={{
                    width: '100%',
                    padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                    marginBottom: '0.5rem',
                    border: 'none',
                    borderRadius: '5px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: activeTab === item.id ? '#3b82f6' : 'transparent',
                    color: activeTab === item.id ? 'white' : '#333',
                    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Backdrop for mobile menu */}
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-backdrop"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 99
              }}
            />
          )}

          {/* Main Content */}
          <div style={{
            flex: 1,
            padding: 'clamp(1rem, 3vw, 2rem)',
            marginLeft: 0
          }} className="main-content">
            {renderContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Desktop styles */
        @media (min-width: 1024px) {
          .mobile-header {
            display: none !important;
          }

          .mobile-backdrop {
            display: none !important;
          }

          .sidebar-mobile {
            left: 0 !important;
            position: static !important;
            height: auto !important;
          }

          .main-content {
            margin-left: 0 !important;
          }

          :global(.lg\\:hidden) {
            display: none !important;
          }
        }

        /* Mobile/Tablet styles */
        @media (max-width: 1023px) {
          .mobile-header {
            display: block !important;
          }

          .mobile-backdrop {
            display: block !important;
          }

          .main-content {
            width: 100%;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}