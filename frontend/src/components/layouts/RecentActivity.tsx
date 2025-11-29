'use client';

import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'student_registered':
        return UserPlusIcon;
      case 'attendance_marked':
        return ClockIcon;
      case 'event_created':
        return CalendarDaysIcon;
      case 'message_sent':
        return ChatBubbleLeftRightIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'student_registered':
        return 'text-green-500 bg-green-50';
      case 'attendance_marked':
        return 'text-blue-500 bg-blue-50';
      case 'event_created':
        return 'text-purple-500 bg-purple-50';
      case 'message_sent':
        return 'text-yellow-500 bg-yellow-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = getIcon(activity.type);
        const iconColors = getIconColor(activity.type);
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColors}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}