// Book Demo button with configuration context

import { Calendar } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';

// Update this URL to your actual demo booking page
const DEMO_URL = 'https://www.sundae.io/demo';

export function BookDemoButton() {
  const { layer, tier, locations, modules: selectedModules, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const handleBookDemo = () => {
    // Build URL with configuration context as query params
    const params = new URLSearchParams({
      locations: locations.toString(),
      tier: `${layer}-${tier}`,
      monthly: pricing.total.toString(),
      modules: selectedModules.join(','),
      source: 'pricing-configurator'
    });
    
    const demoUrl = `${DEMO_URL}?${params.toString()}`;
    
    // Open in new tab
    window.open(demoUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <button
      onClick={handleBookDemo}
      className="button-primary flex items-center justify-center gap-2"
    >
      <Calendar className="w-5 h-5" />
      Book Demo
    </button>
  );
}
