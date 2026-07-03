// Reusable Sundae logo component - Single source of truth for branding.
// The mark + Fraunces logotype lockup mirrors the marketing site navbar so the
// brand reads identically across marketing, pricing, and app surfaces.

import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';
import { SundaeMark } from './SundaeMark';
import { SundaeLogotype } from './SundaeLogotype';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
  variant?: 'wordmark'; // retained for API compatibility
}

const sizeMap = {
  sm: { mark: 26, text: 'text-[20px]', gap: 'gap-2' },
  md: { mark: 30, text: 'text-[24px]', gap: 'gap-2.5' },
  lg: { mark: 34, text: 'text-[30px]', gap: 'gap-2.5' },
};

export function Logo({ size = 'md', className, linkToHome = false }: LogoProps) {
  const { theme } = useTheme();
  const { mark, text, gap } = sizeMap[size];
  const textColor = theme === 'dark' ? '#FBF8F4' : '#2A2320';

  const logoContent = (
    <span className={cn('inline-flex items-center', gap, className)}>
      <SundaeMark size={mark} className="flex-shrink-0" />
      <SundaeLogotype className={text} style={{ color: textColor }} />
    </span>
  );

  if (linkToHome) {
    return (
      <a
        href="/"
        aria-label="Sundae home"
        className="inline-flex items-center transition-opacity hover:opacity-80"
      >
        {logoContent}
      </a>
    );
  }

  return <div className="inline-flex items-center">{logoContent}</div>;
}
