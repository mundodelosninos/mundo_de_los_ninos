'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { EventType, EventStatus } from '@/types/calendar';
import { Button, Badge } from '@/components/ui';

interface CalendarFiltersProps {
  filters: {
    types: EventType[];
    statuses: EventStatus[];
    groups: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const eventTypes = [
    { value: EventType.CLASS, label: 'Clases', color: 'bg-green-500' },
    { value: EventType.MEAL, label: 'Comidas', color: 'bg-yellow-500' },
    { value: EventType.NAP, label: 'Siestas', color: 'bg-purple-500' },
    { value: EventType.ACTIVITY, label: 'Actividades', color: 'bg-blue-500' },
    { value: EventType.MEETING, label: 'Reuniones', color: 'bg-red-500' },
    { value: EventType.EVENT, label: 'Eventos', color: 'bg-orange-500' },
    { value: EventType.HOLIDAY, label: 'Festivos', color: 'bg-pink-500' },
  ];

  const statusOptions = [
    { value: EventStatus.SCHEDULED, label: 'Programado' },
    { value: EventStatus.IN_PROGRESS, label: 'En progreso' },
    { value: EventStatus.COMPLETED, label: 'Completado' },
    { value: EventStatus.CANCELLED, label: 'Cancelado' },
  ];

  const handleTypeToggle = (type: EventType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    
    onFiltersChange({
      ...filters,
      types: newTypes,
    });
  };

  const handleStatusToggle = (status: EventStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFiltersChange({
      ...filters,
      statuses: newStatuses,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      types: [],
      statuses: [],
      groups: [],
    });
  };

  const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0 || filters.groups.length > 0;

  return (
    <div className="relative">
      {/* Botón de filtros */}
      <div className="flex items-center space-x-3">
        <Button
          variant={hasActiveFilters ? "primary" : "outline"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {filters.types.length + filters.statuses.length + filters.groups.length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Panel de filtros */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
          >
            {/* Tipos de evento */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Tipos de evento</h4>
              <div className="space-y-2">
                {eventTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type.value)}
                      onChange={() => handleTypeToggle(type.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      <div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Estados */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Estados</h4>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status.value)}
                      onChange={() => handleStatusToggle(status.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Limpiar todo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.types.map((type) => {
            const typeConfig = eventTypes.find(t => t.value === type);
            return (
              <Badge
                key={type}
                variant="primary"
                className="cursor-pointer"
                onClick={() => handleTypeToggle(type)}
              >
                {typeConfig?.label}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
          
          {filters.statuses.map((status) => {
            const statusConfig = statusOptions.find(s => s.value === status);
            return (
              <Badge
                key={status}
                variant="default"
                className="cursor-pointer"
                onClick={() => handleStatusToggle(status)}
              >
                {statusConfig?.label}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}