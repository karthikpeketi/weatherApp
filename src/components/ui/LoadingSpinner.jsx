const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  text = 'Loading...' 
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-white ${sizes[size]} mb-4`} />
      {text && (
        <p className="text-lg text-white/90 select-none">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;