'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface StatItem {
  label: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}

interface StatsTableProps {
  title?: string;
  description?: string;
  stats: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsTable({
  title,
  description,
  stats,
  columns = 4,
  className = '',
}: StatsTableProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'destructive':
        return 'text-bg-red-1000 bg-bg-red-100';
      default:
        return 'text-bg-red-1000 bg-bg-red-100';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '';
    }
  };

  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
              {stat.icon && (
                <div className={`p-2 rounded-full ${getColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              )}
              {stat.trend && stat.trendValue && (
                <div className="flex items-center mt-2">
                  <Badge
                    variant={stat.trend === 'up' ? 'default' : stat.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {getTrendIcon(stat.trend)} {stat.trendValue}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
