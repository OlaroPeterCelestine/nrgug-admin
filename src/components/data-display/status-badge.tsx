'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'success' | 'warning' | 'error';

interface StatusBadgeProps {
  status: StatusType | string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100',
          icon: <CheckCircle className="h-3 w-3" />,
        };
      case 'inactive':
      case 'failed':
      case 'error':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-500 hover:bg-red-100',
          icon: <XCircle className="h-3 w-3" />,
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
          icon: <Clock className="h-3 w-3" />,
        };
      case 'warning':
        return {
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
          icon: <AlertCircle className="h-3 w-3" />,
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {showIcon && config.icon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {status}
    </Badge>
  );
}

