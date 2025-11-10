'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCardOptimized: React.FC<StatsCardProps> = memo(({ 
  title, 
  value, 
  icon: Icon, 
  loading = false,
  trend 
}) => {
  if (loading) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="mt-4 text-center text-sm text-politico-roxo">
          Carregando 40%
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark transition-all hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-black dark:text-white mb-2">
            {title}
          </h4>
          <p className="text-3xl font-bold text-black dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-politico-roxo/10">
          <Icon className="h-6 w-6 text-politico-roxo" />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.loading === nextProps.loading &&
    prevProps.trend?.value === nextProps.trend?.value &&
    prevProps.trend?.isPositive === nextProps.trend?.isPositive
  );
});

StatsCardOptimized.displayName = 'StatsCardOptimized';

export default StatsCardOptimized;
