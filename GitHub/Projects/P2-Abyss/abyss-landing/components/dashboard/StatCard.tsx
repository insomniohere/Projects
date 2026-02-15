import { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, suffix = '' }: StatCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {displayValue}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
          {trend && (
            <p className={`mt-2 text-sm flex items-center ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
              {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-cyan-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
      </div>
    </div>
  );
}
