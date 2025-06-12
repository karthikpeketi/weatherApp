import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDark, onThemeChange }) => {
  return (
    <button
      onClick={onThemeChange}
      className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;