import { Card } from '@/components/ui/card';

interface KPICard {
  key: string;
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
}

export function KPICards({ data }: { data: KPICard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {data.map((kpi) => (
        <Card key={kpi.key} className="p-4">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{kpi.label}</p>
          <p className="text-2xl font-bold">{kpi.value}</p>
          {kpi.change && (
            <p className={`text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
