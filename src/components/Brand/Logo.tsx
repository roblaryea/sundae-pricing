// Keep the released S/cherry master and approved Fraunces PNGs intact.
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
  variant?: 'lockup' | 'wordmark';
}

const widths = { sm: 128, md: 144, lg: 176 };

export function Logo({ size = 'md', className, linkToHome = false, variant = 'lockup' }: LogoProps) {
  const { theme } = useTheme();
  const width = widths[size];
  // Match the shared main-site proportions without changing source pixels:
  // mark 1.5em, original PNG 6.4em x 1.6em, leading display margin -0.6em.
  // Optical offset matches the colored S/cherry foreground, not its dark tile.
  const markSize = width * 1.5 / 6.4;
  const marginStart = variant === 'lockup' ? -width * 0.6 / 6.4 : 0;
  const logoContent = <>
    {variant === 'lockup' && <img src={`${import.meta.env.BASE_URL}logos/sundae-mark.svg`} alt="" aria-hidden="true" width={markSize} height={markSize} className="block shrink-0" style={{ transform: `translateY(${width * 0.0285 / 6.4}px)` }} data-brand-symbol="sundae" />}
      <img
      src={`${import.meta.env.BASE_URL}logos/sundae-wordmark-fraunces${theme === 'dark' ? '-white' : ''}.png`}
      alt="Sundae"
      width={width}
      height={width / 4}
      className={cn('block shrink-0 select-none object-contain', className)}
      style={{ width, height: width / 4, marginInlineStart: marginStart }}
  /></>;

  return linkToHome
    ? <a href="/" aria-label="Sundae" dir="ltr" className="inline-flex items-center transition-opacity hover:opacity-80">{logoContent}</a>
    : <span dir="ltr" className="inline-flex items-center">{logoContent}</span>;
}
