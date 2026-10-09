import { useLocale } from '../../contexts/LocaleContext';
import { formatLocationAverage } from '../../lib/buyerCopy';

/** Keep the average's unit and estate basis beside the emphasized amount. */
export function AveragePrice({ amount, locations, testId }: { amount: string; locations: number; testId?: string }) {
  const { locale } = useLocale();
  const [before, after] = formatLocationAverage('{price}', locations, locale).split('{price}');
  return <div className="average-price" data-testid={testId}>
    <span className="average-price-label">{before}</span><strong className="average-price-amount"><bdi>{amount}</bdi></strong><span className="average-price-unit">{after}</span>
  </div>;
}
