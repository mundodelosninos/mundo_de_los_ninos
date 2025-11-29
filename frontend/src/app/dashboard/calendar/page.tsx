'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {user.role === 'admin' && 'Gestiona todos los eventos del calendario'}
          {user.role === 'teacher' && 'Gestiona los eventos de tus grupos'}
          {user.role === 'parent' && 'Visualiza los eventos de tus hijos'}
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
