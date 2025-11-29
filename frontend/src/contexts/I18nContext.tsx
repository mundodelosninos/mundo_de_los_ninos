'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

// Traducciones básicas
const translations: Translations = {
  es: {
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.search': 'Buscar',
    'auth.login': 'Iniciar Sesión',
    'auth.logout': 'Cerrar Sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'nav.dashboard': 'Panel Principal',
    'nav.students': 'Estudiantes',
    'nav.groups': 'Grupos',
    'nav.calendar': 'Calendario',
    'nav.chat': 'Chat',
    'nav.reports': 'Reportes',
  },
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'nav.dashboard': 'Dashboard',
    'nav.students': 'Students',
    'nav.groups': 'Groups',
    'nav.calendar': 'Calendar',
    'nav.chat': 'Chat',
    'nav.reports': 'Reports',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    // Cargar idioma desde localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['es', 'en'].includes(savedLang)) {
      setLanguage(savedLang);
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.split('-')[0];
      setLanguage(['es', 'en'].includes(browserLang) ? browserLang as Language : 'es');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}