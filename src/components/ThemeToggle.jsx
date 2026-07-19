import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun size={18} className={`theme-icon theme-icon-sun ${theme === 'light' ? 'visible' : ''}`} />
      <Moon size={18} className={`theme-icon theme-icon-moon ${theme === 'dark' ? 'visible' : ''}`} />
    </button>
  );
};

export default ThemeToggle;
