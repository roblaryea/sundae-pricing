// Use the approved registry PNGs directly; never recreate the identity in type or SVG.
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
  variant?: 'wordmark';
}

const widths = { sm: 128, md: 144, lg: 176 };

export function Logo({ size = 'md', className, linkToHome = false }: LogoProps) {
  const { theme } = useTheme();
  const width = widths[size];
  const logoContent = <img
    src={`${import.meta.env.BASE_URL}logos/sundae-wordmark-fraunces${theme === 'dark' ? '-white' : ''}.png`}
    alt="Sundae"
    width={width}
    height={width / 4}
    className={cn('block shrink-0 select-none object-contain', className)}
    style={{ width, height: width / 4 }}
  />;

  return linkToHome
    ? <a href="/" aria-label="Sundae" className="inline-flex items-center transition-opacity hover:opacity-80">{logoContent}</a>
    : <span className="inline-flex items-center">{logoContent}</span>;
}
