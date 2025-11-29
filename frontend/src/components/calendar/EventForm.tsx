'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CalendarEvent, EventType, EventStatus } from '@/types/calendar';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface EventFormProps {
  event: CalendarEvent;
  onSubmit: (data: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

// Schema de validación con Zod
const eventSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
  allDay: z.boolean(),
  type: z.nativeEnum(EventType),
  status: z.nativeEnum(EventStatus),
  location: z.string().max(200, 'Máximo 200 caracteres').optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

type EventFormData = z.infer<typeof eventSchema>;

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, hasPermission } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title || '',
      description: event.description || '',
      startDate: event.startDate ? 
        new Date(event.startDate).toISOString().slice(0, 16) : 
        new Date().toISOString().slice(0, 16),
      endDate: event.endDate ? 
        new Date(event.endDate).toISOString().slice(0, 16) : 
        new Date(Date.now() + 60*60*1000).toISOString().slice(0, 16), // +1 hora
      allDay: event.allDay || false,
      type: event.type || EventType.CLASS,
      status: event.status || EventStatus.SCHEDULED,
      location: event.location || '',
    },
  });

  const watchAllDay = watch('allDay');
  const watchStartDate = watch('startDate');

  // Actualizar fecha de fin automáticamente
  useEffect(() => {
    if (watchStartDate) {
      const startDate = new Date(watchStartDate);
      const endDate = watchAllDay 
        ? new Date(startDate.getTime() + 24*60*60*1000) // +1 día si es todo el día
        : new Date(startDate.getTime() + 60*60*1000);   // +1 hora si no
      
      setValue('endDate', endDate.toISOString().slice(0, watchAllDay ? 10 : 16));
      clearErrors('endDate');
    }
  }, [watchStartDate, watchAllDay, setValue, clearErrors]);

  const handleFormSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error al guardar evento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypeOptions = [
    { value: EventType.CLASS, label: '📚 Clase', description: 'Sesiones educativas' },
    { value: EventType.MEAL, label: '🍽️ Comida', description: 'Desayuno, almuerzo, merienda' },
    { value: EventType.NAP, label: '😴 Siesta', description: 'Tiempo de descanso' },
    { value: EventType.ACTIVITY, label: '🎨 Actividad', description: 'Juegos, deportes, arte' },
    { value: EventType.MEETING, label: '👥 Reunión', description: 'Juntas con padres o staff' },
    { value: EventType.EVENT, label: '🎉 Evento especial', description: 'Celebraciones, excursiones' },
    { value: EventType.HOLIDAY, label: '🏖️ Día festivo', description: 'Días no laborables' },
  ];

  const statusOptions = [
    { value: EventStatus.SCHEDULED, label: '📅 Programado', color: 'text-blue-600' },
    { value: EventStatus.IN_PROGRESS, label: '▶️ En progreso', color: 'text-yellow-600' },
    { value: EventStatus.COMPLETED, label: '✅ Completado', color: 'text-green-600' },
    { value: EventStatus.CANCELLED, label: '❌ Cancelado', color: 'text-red-600' },
  ];

  // Verificar permisos
  const canEditStatus = hasPermission('calendar.write') && 
    (user?.role === 'admin' || event.createdBy?.id === user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {event.id ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete la información del evento. Los campos con * son obligatorios.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Título */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            📝 Título del evento *
          </label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Ej: Clase de Arte para Grupo A"
            error={errors.title?.message}
            className="text-base font-medium"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Nombre descriptivo para identificar el evento
          </p>
        </div>

        {/* Tipo de evento */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <label htmlFor="type" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            🏷️ Tipo de evento *
          </label>
          <select
            id="type"
            {...register('type')}
            className="block w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {eventTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            📄 Descripción (opcional)
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="block w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Describe los detalles del evento, materiales necesarios, instrucciones especiales..."
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Todo el día */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <input
              id="allDay"
              {...register('allDay')}
              type="checkbox"
              className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allDay" className="flex-1 cursor-pointer">
              <span className="text-base font-semibold text-gray-900 dark:text-white">📅 Evento de todo el día</span>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Sin horario específico (ej: día festivo, excursión)</p>
            </label>
          </div>
        </div>

        {/* Fechas y horas */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">🕐 Fecha y hora</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inicio *
              </label>
              <Input
                id="startDate"
                {...register('startDate')}
                type={watchAllDay ? 'date' : 'datetime-local'}
                error={errors.startDate?.message}
                className="text-base"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fin *
              </label>
              <Input
                id="endDate"
                {...register('endDate')}
                type={watchAllDay ? 'date' : 'datetime-local'}
                error={errors.endDate?.message}
                className="text-base"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <label htmlFor="location" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            📍 Ubicación (opcional)
          </label>
          <Input
            id="location"
            {...register('location')}
            placeholder="Ej: Aula 1, Patio principal, Sala de música..."
            error={errors.location?.message}
            className="text-base"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Especifica dónde se realizará el evento
          </p>
        </div>

        {/* Estado (solo si tiene permisos) */}
        {canEditStatus && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado del evento
            </label>
            <select
              id="status"
              {...register('status')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Indica el estado actual del evento
            </p>
          </div>
        )}

        {/* Información adicional para eventos existentes */}
        {event.id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Información del evento
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Creado por:</strong> {event.createdBy?.fullName}</p>
              <p><strong>Fecha de creación:</strong> {new Date(event.createdAt).toLocaleString('es-ES')}</p>
              {event.updatedAt !== event.createdAt && (
                <p><strong>Última actualización:</strong> {new Date(event.updatedAt).toLocaleString('es-ES')}</p>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 text-base font-semibold"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 min-w-[160px]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Guardando...</span>
              </div>
            ) : (
              <>
                {event.id ? '✅ Actualizar Evento' : '➕ Crear Evento'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}