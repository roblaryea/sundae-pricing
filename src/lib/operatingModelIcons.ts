import { Store, Building2, Hotel, Truck, PartyPopper, Factory, type LucideIcon } from 'lucide-react';
import type { PricingIntent } from './pricingIntent';

// Same symbols as sundae-app/src/lib/operator-models.ts. Pricing groups several
// onboarding models under broader choices; this is presentation only.
export const OPERATING_MODEL_ICONS: Record<PricingIntent['operatingModels'][number], LucideIcon> = {
  single_brand: Store,
  multi_brand: Building2,
  franchise: Building2,
  hotel_fb: Hotel,
  cloud_kitchen: Truck,
  catering: PartyPopper,
  production: Factory,
};
