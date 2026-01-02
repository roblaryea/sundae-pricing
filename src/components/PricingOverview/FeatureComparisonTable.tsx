import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  [key: string]: string;
}

interface FeatureCategory {
  category: string;
  features: Feature[];
}

interface FeatureComparisonTableProps {
  data: FeatureCategory[];
  tierKeys: string[];
  tierLabels: string[];
  tierColors: string[];
}

export function FeatureComparisonTable({ data, tierKeys, tierLabels, tierColors }: FeatureComparisonTableProps) {
  const renderCell = (value: string) => {
    if (value === '✓') {
      return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    }
    if (value === '❌') {
      return <X className="w-5 h-5 text-red-500/50 mx-auto" />;
    }
    return <span className="text-white text-sm">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-white/10 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-white/5">
            <th className="text-left p-4 font-semibold text-white border-r border-white/10 min-w-[250px]">
              Feature
            </th>
            {tierLabels.map((label, idx) => (
              <th
                key={label}
                className="text-center p-4 font-semibold border-r border-white/10 last:border-r-0 min-w-[180px]"
                style={{ color: tierColors[idx] }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((categoryData, catIdx) => (
            <>
              {/* Category Header */}
              <tr key={`cat-${catIdx}`} className="bg-white/10">
                <td
                  colSpan={tierKeys.length + 1}
                  className="p-3 font-bold text-white uppercase text-sm tracking-wide"
                >
                  {categoryData.category}
                </td>
              </tr>
              {/* Features in Category */}
              {categoryData.features.map((feature, featIdx) => (
                <tr
                  key={`feat-${catIdx}-${featIdx}`}
                  className={featIdx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}
                >
                  <td className="p-4 text-sundae-muted border-r border-white/10">
                    {feature.name}
                  </td>
                  {tierKeys.map((key) => (
                    <td
                      key={key}
                      className="text-center p-4 border-r border-white/10 last:border-r-0"
                    >
                      {renderCell(feature[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
