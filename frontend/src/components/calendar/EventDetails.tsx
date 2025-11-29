'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { CalendarEvent, EventType, EventStatus } from '@/types/calendar';
import { Button, Badge } from '@/components/ui';

interface EventDetailsProps {
  event: CalendarEvent;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function EventDetails({
  event,
  onEdit,
  onDelete,
  onClose,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
}: EventDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive edit/delete permissions from props or callback presence
  const canEdit = canEditProp !== undefined ? canEditProp : !!onEdit;
  const canDelete = canDeleteProp !== undefined ? canDeleteProp : !!onDelete;

  const formatDate = (date: Date) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  const getTypeLabel = (type: EventType) => {
    const labels = {
      [EventType.CLASS]: 'Clase',
      [EventType.MEAL]: 'Comida',
      [EventType.NAP]: 'Siesta',
      [EventType.ACTIVITY]: 'Actividad',
      [EventType.MEETING]: 'Reunión',
      [EventType.EVENT]: 'Evento especial',
      [EventType.HOLIDAY]: 'Día festivo',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      [EventStatus.SCHEDULED]: { variant: 'default' as const, label: 'Programado' },
      [EventStatus.IN_PROGRESS]: { variant: 'primary' as const, label: 'En progreso' },
      [EventStatus.COMPLETED]: { variant: 'success' as const, label: 'Completado' },
      [EventStatus.CANCELLED]: { variant: 'danger' as const, label: 'Cancelado' },
    };

    const config = statusConfig[status] || statusConfig[EventStatus.SCHEDULED];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <div className="flex items-center space-x-3 mt-2">
            <span className="text-sm text-gray-500">{getTypeLabel(event.type)}</span>
            {getStatusBadge(event.status)}
          </div>
        </div>
        
        {(canEdit || canDelete) && (
          <div className="flex space-x-2">
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Descripción */}
      {event.description && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      {/* Detalles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Detalles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha */}
          <div className="flex items-start space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Fecha</p>
              <p className="text-sm text-gray-700">
                {formatDate(event.startDate)}
                {new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && (
                  <> - {formatDate(event.endDate)}</>
                )}
              </p>
            </div>
          </div>

          {/* Hora */}
          {!event.allDay && (
            <div className="flex items-start space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Hora</p>
                <p className="text-sm text-gray-700">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </p>
              </div>
            </div>
          )}

          {/* Ubicación */}
          {event.location && (
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ubicación</p>
                <p className="text-sm text-gray-700">{event.location}</p>
              </div>
            </div>
          )}

          {/* Creado por */}
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Creado por</p>
              <p className="text-sm text-gray-700">{event.createdBy.fullName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Participantes */}
      {event.participants && event.participants.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Participantes</h3>
          <div className="space-y-2">
            {event.participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Participante {participant.participantType}
                  </p>
                  <p className="text-sm text-gray-500">
                    Estado: {participant.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadatos */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Creado: {formatDate(event.createdAt)}</span>
          <span>Actualizado: {formatDate(event.updatedAt)}</span>
        </div>
      </div>

      {/* Botón cerrar */}
      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </motion.div>
  );
}