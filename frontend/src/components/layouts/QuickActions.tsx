'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Definir tipos específicos para los colores
type ColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: ColorType; // Cambiar de string a ColorType específico
  href: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const colorClasses: Record<ColorType, string> = {
    primary: 'bg-primary-500 hover:bg-primary-600',
    secondary: 'bg-purple-500 hover:bg-purple-600',
    success: 'bg-green-500 hover:bg-green-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    danger: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link
            href={action.href}
            className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colorClasses[action.color]} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}