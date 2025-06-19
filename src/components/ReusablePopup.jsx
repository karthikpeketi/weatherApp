import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// CSS-in-JS for perfect centering across all devices
const popupContainerStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  zIndex: 9999, // Ensure it's above everything
  overflow: 'auto' // Allow scrolling if content is too tall
};

const popupContentStyles = (maxHeight, maxWidth) => ({
  maxHeight: `calc(${maxHeight} - 2rem)`,
  minHeight: 'fit-content',
  minWidth: 'fit-content',
  maxWidth: `calc(${maxWidth} - 2rem)`,
  display: 'flex',
  flexDirection: 'column',
  margin: 'auto',
  position: 'relative',
  boxSizing: 'border-box'
});

const ReusablePopup = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = '100%',
  maxHeight = '90vh', // Changed to accept direct values for better control
  showCloseButton = true,
  titleIcon = null,
  className = ''
}) => {
  // Handle escape key press and body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore original styles
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const popupContent = (
    <div 
      className="bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={popupContainerStyles}
    >
      <div 
        className={`w-full bg-white/10 backdrop-blur-md rounded-3xl text-white ${className}`}
        style={popupContentStyles(maxHeight, maxWidth)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {titleIcon && <span className="text-white">{titleIcon}</span>}
            <h3 className="text-2xl font-semibold">{title}</h3>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="popup-content px-6 pb-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );

  // Use React Portal to render popup outside the main app container
  return createPortal(popupContent, document.body);
};

export default ReusablePopup;