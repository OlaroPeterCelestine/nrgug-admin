'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Newspaper,
  Calendar,
  Building2,
  Users,
  Mail,
  Settings,
  LogOut,
  Home,
  UserPlus,
  MailCheck,
  Video,
  Star,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Clock } from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and statistics',
  },
  {
    name: 'News',
    href: '/news',
    icon: Newspaper,
    description: 'Manage news articles and hero section',
  },
  {
    name: 'Shows',
    href: '/shows',
    icon: Calendar,
    description: 'Schedule shows and events',
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Building2,
    description: 'Client management',
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    description: 'System users',
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: Activity,
    description: 'User sessions',
  },
  {
    name: 'Videos',
    href: '/videos',
    icon: Video,
    description: 'Manage video content',
  },
  {
    name: 'Email Management',
    href: '/email-management',
    icon: Mail,
    description: 'Subscribers, campaigns & logs',
  },
  {
    name: 'Contact Messages',
    href: '/contact-messages',
    icon: MailCheck,
    description: 'Manage contact form submissions',
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, lastActivity, updateActivity } = useAuth();

  return (
    <div className={cn('flex h-screen w-64 flex-col bg-gray-50 border-r overflow-hidden', className)}>
      {/* Header */}
      <div className="flex h-20 items-center border-b px-4 sm:px-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">NRGUG Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-3 sm:p-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-14 sm:h-16 px-3 sm:px-4 text-base sm:text-lg',
                  isActive && 'bg-gray-200 text-gray-900'
                )}
              >
                <item.icon className="mr-3 sm:mr-4 h-6 w-6 sm:h-7 sm:w-7" />
                <span className="font-semibold truncate">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t p-3 sm:p-6 flex-shrink-0">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-sm sm:text-base font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              {user?.name || 'Admin'}
            </p>
            <p className="text-sm text-gray-500 truncate hidden sm:block">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
        
        {/* Session Status - Only show when user is logged in */}
        {user && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-100 rounded-md">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Session Active</span>
                <span className="sm:hidden">Active</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={updateActivity}
                className="h-7 sm:h-8 px-2 sm:px-3 text-sm"
              >
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">↻</span>
              </Button>
            </div>
          </div>
        )}
        
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full justify-start h-10 sm:h-12 text-sm sm:text-base"
          >
            <LogOut className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </Button>
        )}
      </div>
    </div>
  );
}
