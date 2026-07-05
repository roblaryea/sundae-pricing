// Theme toggle switch for light/dark mode

import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';
import { tMicro } from '../../lib/pricingI18n';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-slate-700 dark:bg-slate-700 rounded-full p-1 transition-colors hover:bg-slate-600"
      aria-label={tMicro(locale, theme === 'dark' ? 'switchToLight' : 'switchToDark')}
    >
      {/* Track icons */}
      <Sun className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
      <Moon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      
      {/* Sliding thumb */}
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: theme === 'dark' ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
