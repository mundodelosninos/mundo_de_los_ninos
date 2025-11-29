'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

// Definir tipos específicos
type ColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
type ChangeType = 'positive' | 'negative' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: ChangeType;
  icon: React.ComponentType<any>;
  color?: ColorType; // Cambiar de string a ColorType específico
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'primary',
}: StatCardProps) {
  const colorClasses: Record<ColorType, string> = {
    primary: 'bg-primary-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const changeColors: Record<ChangeType, string> = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-soft p-6 border border-gray-100"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="text-sm font-medium text-gray-500 truncate">
            {title}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {value}
          </div>
        </div>
      </div>
      
      {change && (
        <div className="mt-4">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
            {changeType === 'positive' && <ArrowUpIcon className="w-3 h-3 mr-1" />}
            {changeType === 'negative' && <ArrowDownIcon className="w-3 h-3 mr-1" />}
            {change}
          </div>
          <span className="ml-2 text-sm text-gray-500">vs mes anterior</span>
        </div>
      )}
    </motion.div>
  );
}