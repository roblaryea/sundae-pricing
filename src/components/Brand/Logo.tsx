// Reusable Sundae logo component - Single source of truth for branding

import { cn } from '../../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
  variant?: 'wordmark'; // Only wordmark for now
}

const sizeMap = {
  sm: 'h-8 md:h-9', // 32-36px (was 24-28px, +33%)
  md: 'h-9 md:h-11', // 36-44px (was 28-32px, +35%)
  lg: 'h-11 md:h-13', // 44-52px (was 32-40px, +30%)
};

export function Logo({ size = 'md', className, linkToHome = false }: LogoProps) {
  const logoImg = (
    <img
      src="/logos/sundae-wordmark.png"
      alt="Sundae"
      className={cn(
        sizeMap[size],
        'w-auto object-contain',
        className
      )}
      onError={(e) => {
        // Fallback to text if image fails to load
        const target = e.currentTarget;
        target.style.display = 'none';
        const fallback = target.nextElementSibling as HTMLElement;
        if (fallback) {
          fallback.style.display = 'block';
        }
      }}
    />
  );

  const fallbackText = (
    <span
      className={cn(
        'font-bold bg-gradient-primary bg-clip-text text-transparent hidden',
        size === 'sm' && 'text-xl',
        size === 'md' && 'text-2xl md:text-3xl',
        size === 'lg' && 'text-3xl md:text-4xl',
        className
      )}
    >
      Sundae 🍨
    </span>
  );

  const logoContent = (
    <>
      {logoImg}
      {fallbackText}
    </>
  );

  if (linkToHome) {
    return (
      <a
        href="/"
        aria-label="Sundae home"
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </a>
    );
  }

  return <div className="inline-flex items-center">{logoContent}</div>;
}
