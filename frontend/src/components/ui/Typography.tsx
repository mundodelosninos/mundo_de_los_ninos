import React from 'react';

// Type definitions for the Typography component
type TypographyVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'display-1' | 'display-2'
  | 'body-large' | 'body' | 'body-small'
  | 'label-large' | 'label' | 'label-small'
  | 'caption' | 'overline';

type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';

type TypographyColor =
  | 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  | 'muted' | 'white';

interface TypographyProps {
  variant?: TypographyVariant;
  as?: TypographyElement;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  noMargin?: boolean;
}

// Mapping variant to default HTML element
const variantElementMap: Record<TypographyVariant, TypographyElement> = {
  'h1': 'h1',
  'h2': 'h2',
  'h3': 'h3',
  'h4': 'h4',
  'h5': 'h5',
  'h6': 'h6',
  'display-1': 'h1',
  'display-2': 'h1',
  'body-large': 'p',
  'body': 'p',
  'body-small': 'p',
  'label-large': 'label',
  'label': 'label',
  'label-small': 'label',
  'caption': 'span',
  'overline': 'span',
};

// Mapping variant to CSS classes
const variantClassMap: Record<TypographyVariant, string> = {
  'h1': 'heading-1',
  'h2': 'heading-2',
  'h3': 'heading-3',
  'h4': 'heading-4',
  'h5': 'heading-5',
  'h6': 'heading-6',
  'display-1': 'display-1',
  'display-2': 'display-2',
  'body-large': 'body-large',
  'body': 'body-base',
  'body-small': 'body-small',
  'label-large': 'label-large',
  'label': 'label-base',
  'label-small': 'label-small',
  'caption': 'caption',
  'overline': 'overline',
};

// Color classes mapping
const colorClassMap: Record<TypographyColor, string> = {
  'default': 'text-gray-900 dark:text-gray-100',
  'primary': 'text-primary-600 dark:text-primary-400',
  'secondary': 'text-secondary-600 dark:text-secondary-400',
  'success': 'text-success-600 dark:text-success-400',
  'warning': 'text-warning-600 dark:text-warning-400',
  'danger': 'text-danger-600 dark:text-danger-400',
  'muted': 'text-gray-500 dark:text-gray-400',
  'white': 'text-white',
};

// Weight classes
const weightClassMap = {
  'light': 'font-light',
  'normal': 'font-normal',
  'medium': 'font-medium',
  'semibold': 'font-semibold',
  'bold': 'font-bold',
};

// Alignment classes
const alignClassMap = {
  'left': 'text-left',
  'center': 'text-center',
  'right': 'text-right',
  'justify': 'text-justify',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  color = 'default',
  className = '',
  children,
  weight,
  align,
  truncate = false,
  noMargin = false,
  ...props
}) => {
  // Determine the HTML element to render
  const Element = as || variantElementMap[variant];

  // Build class names
  const classes = [
    variantClassMap[variant],
    colorClassMap[color],
    weight && weightClassMap[weight],
    align && alignClassMap[align],
    truncate && 'truncate',
    noMargin && 'm-0',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement(Element, { className: classes, ...props }, children);
};

// Specialized components for convenience
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const Heading6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label" {...props} />
);

// Export default
export default Typography;
