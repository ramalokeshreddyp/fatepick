
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors border border-border"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} className="text-foreground" /> : <Sun size={20} className="text-foreground" />}
    </button>
  );
};
