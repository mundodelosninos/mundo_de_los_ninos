'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, EventType, EventStatus } from '@/types/calendar';
import { calendarApi, CreateEventDTO, UpdateEventDTO } from '@/services/api/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { EventForm } from './EventForm';
import { EventDetails } from './EventDetails';
import { CalendarFilters } from './CalendarFilters';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export function CalendarView() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState({
    types: [] as EventType[],
    statuses: [] as EventStatus[],
    groups: [] as string[],
  });

  const canCreateEvents = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const data = await calendarApi.getEvents(
        start.toISOString(),
        end.toISOString()
      );
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const createData: CreateEventDTO = {
        title: eventData.title!,
        description: eventData.description,
        type: eventData.type!,
        startDate: new Date(eventData.startDate!).toISOString(),
        endDate: new Date(eventData.endDate!).toISOString(),
        allDay: eventData.allDay || false,
        location: eventData.location,
      };

      await calendarApi.createEvent(createData);
      setIsCreating(false);
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const handleUpdateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!selectedEvent) return;

    try {
      const updateData: UpdateEventDTO = {
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        status: eventData.status,
        startDate: eventData.startDate ? new Date(eventData.startDate).toISOString() : undefined,
        endDate: eventData.endDate ? new Date(eventData.endDate).toISOString() : undefined,
        allDay: eventData.allDay,
        location: eventData.location,
      };

      await calendarApi.updateEvent(selectedEvent.id, updateData);
      setIsEditing(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      await calendarApi.deleteEvent(id);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const filteredEvents = filters.types.length > 0 || filters.statuses.length > 0
    ? events.filter(event => {
        const typeMatch = filters.types.length === 0 || filters.types.includes(event.type);
        const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(event.status);
        return typeMatch && statusMatch;
      })
    : events;

  const getEventColor = (type: EventType) => {
    const colors = {
      [EventType.CLASS]: 'bg-blue-500 hover:bg-blue-600',
      [EventType.MEAL]: 'bg-green-500 hover:bg-green-600',
      [EventType.NAP]: 'bg-purple-500 hover:bg-purple-600',
      [EventType.ACTIVITY]: 'bg-yellow-500 hover:bg-yellow-600',
      [EventType.MEETING]: 'bg-red-500 hover:bg-red-600',
      [EventType.EVENT]: 'bg-indigo-500 hover:bg-indigo-600',
      [EventType.HOLIDAY]: 'bg-pink-500 hover:bg-pink-600',
    };
    return colors[type] || 'bg-gray-500 hover:bg-gray-600';
  };

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = day;
      const dayEvents = filteredEvents.filter(event =>
        isSameDay(new Date(event.startDate), currentDay)
      );

      days.push(
        <motion.div
          key={day.toString()}
          whileHover={{ scale: 1.02 }}
          className={`min-h-[140px] p-3 border-2 rounded-xl transition-all ${
            !isSameMonth(currentDay, monthStart)
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
          } ${
            isSameDay(currentDay, new Date())
              ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20'
              : 'hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className={`text-sm font-bold mb-2 ${
            isSameDay(currentDay, new Date())
              ? 'text-blue-600 dark:text-blue-400'
              : !isSameMonth(currentDay, monthStart)
              ? 'text-gray-400 dark:text-gray-600'
              : 'text-gray-800 dark:text-gray-200'
          }`}>
            {format(currentDay, 'd', { locale: es })}
          </div>
          <div className="space-y-1.5">
            {dayEvents.slice(0, 3).map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left text-xs px-2.5 py-2 rounded-lg ${getEventColor(event.type)} text-white truncate transition-all shadow-md hover:shadow-lg font-medium`}
                title={event.title}
              >
                {event.title}
              </button>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold pl-2 pt-1">
                +{dayEvents.length - 3} más
              </div>
            )}
          </div>
        </motion.div>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <span className="text-lg">←</span>
          </button>
          <h2 className="text-2xl lg:text-3xl font-bold capitalize text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <span className="text-lg">→</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <CalendarFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
          {canCreateEvents && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
            >
              + Crear Evento
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
            {day}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-96 bg-white dark:bg-gray-900 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando eventos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          {renderCalendarDays()}
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <EventForm
                event={{
                  title: '',
                  type: EventType.EVENT,
                  status: EventStatus.SCHEDULED,
                  startDate: new Date(),
                  endDate: new Date(),
                  allDay: false,
                } as CalendarEvent}
                onSubmit={handleCreateEvent}
                onCancel={() => setIsCreating(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {selectedEvent && !isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <EventDetails
                event={selectedEvent}
                onEdit={canCreateEvents ? () => setIsEditing(true) : undefined}
                onDelete={canCreateEvents ? () => handleDeleteEvent(selectedEvent.id) : undefined}
                onClose={() => setSelectedEvent(null)}
              />
            </motion.div>
          </motion.div>
        )}

        {selectedEvent && isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setIsEditing(false);
              setSelectedEvent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <EventForm
                event={selectedEvent}
                onSubmit={handleUpdateEvent}
                onCancel={() => {
                  setIsEditing(false);
                  setSelectedEvent(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
