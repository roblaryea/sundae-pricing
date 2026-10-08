import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { englishFeatureHelp, extraFeatureHelp, featureHelpLabels, type FeatureHelpId } from '../../lib/featureHelpCopy';

const OPEN_EVENT = 'sundae-feature-help-open';

/** Text-only help: focus stays on the trigger; click pins it for touch users. */
export function FeatureHelp({ feature, name }: { feature: FeatureHelpId; name: string }) {
  const { locale, messages, dir } = useLocale();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pinned = useRef(false);
  const dismissed = useRef(false);
  const [open, setOpen] = useState(false);
  const description = extraFeatureHelp(feature, locale) ?? (
    feature === 'cross_pro' ? messages.catalog.crossIntelligence.pro.description :
    feature in messages.catalog.modules ? messages.catalog.modules[feature as keyof typeof messages.catalog.modules].description :
    feature in messages.catalog.watchtower ? messages.catalog.watchtower[feature as keyof typeof messages.catalog.watchtower].description :
    englishFeatureHelp[feature]
  );
  const cancelClose = () => clearTimeout(timer.current);
  const show = () => {
    cancelClose();
    dismissed.current = false;
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    setOpen(true);
  };
  const close = useCallback(() => {
    clearTimeout(timer.current);
    pinned.current = false;
    dismissed.current = true;
    setOpen(false);
  }, []);
  const scheduleClose = () => {
    cancelClose();
    if (!pinned.current && document.activeElement !== trigger.current) timer.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent | FocusEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const otherHelp = (event: Event) => { if ((event as CustomEvent<string>).detail !== id) close(); };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', escape);
    window.addEventListener(OPEN_EVENT, otherHelp);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener(OPEN_EVENT, otherHelp);
    };
  }, [open, id, close]);
  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      if (!trigger.current || !panel.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      const height = panel.current.offsetHeight;
      const width = panel.current.offsetWidth;
      const above = anchor.top >= height + 20;
      const top = above ? anchor.top - height - 8 : anchor.bottom + 8;
      const left = Math.max(12, Math.min(window.innerWidth - width - 12, anchor.left + anchor.width / 2 - width / 2));
      panel.current.style.left = `${left}px`;
      panel.current.style.top = `${Math.max(12, Math.min(window.innerHeight - height - 12, top))}px`;
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open, description]);
  return <span className="feature-help">
    <button ref={trigger} type="button" className="feature-help-trigger" data-feature-help={feature}
      aria-label={featureHelpLabels[locale].replace('{feature}', name)} aria-expanded={open} aria-describedby={open ? id : undefined}
      onPointerEnter={(event) => { if (event.pointerType !== 'touch') show(); }} onPointerLeave={scheduleClose}
      onFocus={() => { if (!dismissed.current) show(); }} onBlur={() => { dismissed.current = false; scheduleClose(); }}
      onClick={() => { if (pinned.current) close(); else { pinned.current = true; show(); } }}>
      <Info size={15} strokeWidth={1.7} aria-hidden="true"/>
    </button>
    {open && createPortal(<div ref={panel} id={`${id}-panel`} role="tooltip" className="feature-help-panel" dir={dir}
      onPointerEnter={cancelClose} onPointerLeave={scheduleClose}>
      <strong>{name}</strong><p id={id}>{description}</p>
    </div>, document.body)}
  </span>;
}

export function FeatureLabel({ feature, name, children }: { feature: FeatureHelpId; name: string; children?: ReactNode }) {
  return <span className="feature-label"><span>{children ?? name}</span><FeatureHelp feature={feature} name={name}/></span>;
}
