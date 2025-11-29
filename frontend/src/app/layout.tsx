'use client';

import { Inter, Poppins } from 'next/font/google';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { PWAPrompt } from '@/components/PWAPrompt';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Removed hydration check that was causing issues

  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <title>Mundo de Niños - Sistema de Gestión</title>
        <meta name="description" content="Sistema completo de gestión para centros lúdicos" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/logo_mundodelosninos.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mundo de Niños" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" href="/icons/logo_mundodelosninos.png" />
        <link rel="shortcut icon" type="image/png" href="/icons/logo_mundodelosninos.png" />
        
        {/* Fonts preload */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap"
          as="style"
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  {children}
                  
                  {/* Toast notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#22c55e',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 5000,
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                  
                  {/* PWA Install Prompt */}
                  <PWAPrompt />
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}