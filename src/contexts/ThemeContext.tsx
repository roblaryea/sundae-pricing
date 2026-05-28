// Theme context for light/dark mode toggle

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('sundae-theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to dark — pricing site is designed dark-first; visitors can
    // still toggle, and their choice persists in localStorage.
    return 'dark';
  });
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    localStorage.setItem('sundae-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
