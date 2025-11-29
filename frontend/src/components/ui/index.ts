import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

// Button Component
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  href,
  onClick,
  type = 'button',
  ...props 
}: ButtonProps): React.ReactElement {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  if (href) {
    return React.createElement(
      'a', 
      { href, className: classes, ...props },
      children
    );
  }

  return React.createElement(
    'button',
    { 
      className: classes, 
      disabled, 
      type, 
      onClick, 
      ...props 
    },
    children
  );
}

// Input Component
export const Input = React.forwardRef<HTMLInputElement, {
  error?: string;
  className?: string;
  [key: string]: any;
}>(({ error, className = '', ...props }, ref) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500';
  const errorClasses = error ? 'border-red-300' : 'border-gray-300';

  return React.createElement(
    'div',
    {},
    React.createElement('input', {
      ref,
      className: `${baseClasses} ${errorClasses} ${className}`,
      ...props
    }),
    error && React.createElement(
      'p',
      { className: 'mt-1 text-sm text-red-600' },
      error
    )
  );
});

Input.displayName = 'Input';

// Card Component
export function Card({ 
  children, 
  className = '', 
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return React.createElement(
    'div',
    { 
      className: `bg-white overflow-hidden shadow-sm rounded-lg ${className}`,
      ...props
    },
    children
  );
}

// Logo Component
export function Logo({ className = '', ...props }: { className?: string; [key: string]: any }) {
  return React.createElement(
    'div',
    { className: `flex items-center ${className}`, ...props },
    React.createElement(
      'div',
      { className: 'flex-shrink-0' },
      React.createElement(
        'div',
        { className: 'h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center' },
        React.createElement(
          'span',
          { className: 'text-white font-bold text-lg' },
          'G'
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'ml-2' },
      React.createElement(
        'span',
        { className: 'text-xl font-bold text-gray-900 font-heading' },
        'Centro Lúdico'
      )
    )
  );
}

// Loading Spinner Component
export function LoadingSpinner({ 
  size = 'md',
  className = '' 
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return React.createElement(
    'div',
    { className: `animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizes[size]} ${className}` }
  );
}

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Avatar Component
export function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
}: AvatarProps): React.ReactElement {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  if (src) {
    return React.createElement('img', {
      src,
      alt,
      className: `${sizes[size]} rounded-full object-cover ${className}`
    });
  }

  // Mostrar iniciales si no hay imagen
  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return React.createElement(
    'div',
    { className: `${sizes[size]} rounded-full bg-gray-300 flex items-center justify-center ${className}` },
    React.createElement(
      'span',
      { className: `font-medium text-gray-700 ${textSizes[size]}` },
      initials
    )
  );
}

// Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return React.createElement(
    'div',
    { className: 'fixed inset-0 z-50 overflow-y-auto' },
    React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0' },
      React.createElement('div', {
        className: 'fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75',
        onClick: onClose
      }),
      React.createElement(
        'div',
        { className: `inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg` },
        title && React.createElement(
          'div',
          { className: 'mb-4' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium leading-6 text-gray-900' },
            title
          )
        ),
        children
      )
    )
  );
}

// Badge Component
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-sm',
  };

  const baseClasses = `inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`;
  
  // Si tiene onClick, hacer el badge clickeable
  if (onClick) {
    return React.createElement(
      'button',
      { 
        className: `${baseClasses} hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2`,
        onClick,
        ...props
      },
      children
    );
  }

  return React.createElement(
    'span',
    { className: baseClasses, ...props },
    children
  );
}

// Export Typography components
export {
  Typography,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  BodyText,
  Caption,
  Label,
} from './Typography';