'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Logo, Button, Avatar } from '@/components/ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: `/${user?.role}/dashboard`,
      icon: HomeIcon,
      roles: ['admin', 'teacher', 'parent'],
    },
    {
      name: 'Estudiantes',
      href: `/${user?.role}/students`,
      icon: AcademicCapIcon,
      roles: ['admin', 'teacher', 'parent'],
    },
    {
      name: 'Grupos',
      href: `/${user?.role}/groups`,
      icon: UserGroupIcon,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'Calendario',
      href: `/${user?.role}/calendar`,
      icon: CalendarDaysIcon,
      roles: ['admin', 'teacher', 'parent'],
    },
    {
      name: 'Chat',
      href: `/${user?.role}/chat`,
      icon: ChatBubbleLeftRightIcon,
      roles: ['admin', 'teacher', 'parent'],
    },
    {
      name: 'Reportes',
      href: `/${user?.role}/reports`,
      icon: DocumentChartBarIcon,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'Configuración',
      href: `/${user?.role}/settings`,
      icon: Cog6ToothIcon,
      roles: ['admin'],
    },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col w-full max-w-xs p-4 ml-auto bg-white shadow-xl">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="mt-8 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <Logo />
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Estado de conexión */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
                {onlineUsers.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({onlineUsers.length} en línea)
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="text-gray-400 hover:text-gray-500 relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Menú de usuario */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.fullName || ''}
                    size="sm"
                  />
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.fullName}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Salir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}