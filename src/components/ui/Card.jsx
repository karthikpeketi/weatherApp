import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'rounded-3xl backdrop-blur-md transition-all duration-200';
  
  const variants = {
    default: 'bg-white/10 text-white',
    glass: 'bg-white/5 text-white border border-white/10',
    solid: 'bg-white text-gray-900 shadow-lg',
    dark: 'bg-gray-900/80 text-white border border-gray-700/50',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold mb-2 ${className}`} {...props}>
    {children}
  </h3>
);

export { Card, CardHeader, CardContent, CardTitle };