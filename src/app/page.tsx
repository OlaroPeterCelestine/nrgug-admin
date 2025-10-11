'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Layout } from '@/components/layout';
import { LoginForm } from '@/components/login-form';
import { SessionWarning } from '@/components/session-warning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Newspaper, 
  Calendar, 
  Building2, 
  UserPlus, 
  Mail, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { fastApi } from '@/lib/api';
import { MailStats } from '@/types';

export default function DashboardPage() {
  const { user, loading, login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [stats, setStats] = useState({
    newsCount: 0,
    showsCount: 0,
    clientsCount: 0,
    subscribersCount: 0,
    upcomingShows: 0,
    userSubscriptions: 0,
    loading: true
  });
  const [mailStats, setMailStats] = useState<MailStats | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await login(email, password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    // Only fetch stats if user is authenticated
    if (!user) {
      return;
    }

    const fetchStats = async () => {
      try {
        // Helper function to safely get data
        const safeGetData = (response: any) => {
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          }
          return [];
        };

        // Phase 1: Load essential data first (fastest endpoints)
        const [showsResponse, subscribersResponse] = await Promise.allSettled([
          fastApi.shows.getAll(),
          fastApi.subscribers.getAll()
        ]);

        const shows = showsResponse.status === 'fulfilled' ? safeGetData(showsResponse.value) : [];
        const subscribers = subscribersResponse.status === 'fulfilled' ? safeGetData(subscribersResponse.value) : [];

        // Calculate upcoming shows
        const now = new Date();
        const upcomingShows = shows.filter((show: any) => new Date(show.time_from) > now).length;

        // Update stats immediately with essential data
        setStats(prev => ({
          ...prev,
          showsCount: shows.length,
          subscribersCount: subscribers.length,
          upcomingShows: upcomingShows,
          loading: false
        }));
        setDataLoaded(true);

        // Phase 2: Load remaining data in background
        const [newsResponse, clientsResponse, subscriptionsResponse, mailStatsResponse] = await Promise.allSettled([
          fastApi.news.getAll(),
          fastApi.clients.getAll(),
          fastApi.subscriptions.getAll(),
          fastApi.mailLogs.getStats()
        ]);

        const news = newsResponse.status === 'fulfilled' ? safeGetData(newsResponse.value) : [];
        const clients = clientsResponse.status === 'fulfilled' ? safeGetData(clientsResponse.value) : [];
        const subscriptions = subscriptionsResponse.status === 'fulfilled' ? safeGetData(subscriptionsResponse.value) : [];

        // Update with remaining data
        setStats(prev => ({
          ...prev,
          newsCount: news.length,
          clientsCount: clients.length,
          userSubscriptions: subscriptions.length
        }));
        
        if (mailStatsResponse.status === 'fulfilled' && mailStatsResponse.value.data) {
          setMailStats(mailStatsResponse.value.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
        setDataLoaded(true);
      }
    };

    fetchStats();
  }, [user]);

  // Show loading while auth context initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        loading={isLoggingIn} 
        error={loginError} 
      />
    );
  }

  // Show loading while stats are loading
  if (stats.loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
            {dataLoaded && (
              <p className="text-sm text-gray-500 mt-2">Loading additional data...</p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  const statsData = [
    {
      title: 'Total News Articles',
      value: stats.newsCount.toString(),
      change: '+12%',
      icon: Newspaper,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Upcoming Shows',
      value: stats.upcomingShows.toString(),
      change: `+${stats.showsCount - stats.upcomingShows}`,
      icon: Calendar,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Active Clients',
      value: stats.clientsCount.toString(),
      change: '+2',
      icon: Building2,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Email Subscribers',
      value: stats.subscribersCount.toString(),
      change: '+45',
      icon: UserPlus,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
  ];


  return (
    <Layout>
      <SessionWarning />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Email Statistics */}
        {mailStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{mailStats?.total_emails || 0}</p>
                    <p className="text-xs text-gray-500">All time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Sent Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{mailStats?.sent_emails || 0}</p>
                    <p className="text-xs text-gray-500">
                      {(mailStats?.total_emails || 0) > 0 
                        ? `${Math.round(((mailStats?.sent_emails || 0) / (mailStats?.total_emails || 1)) * 100)}% success rate`
                        : 'No emails sent'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{mailStats?.pending_emails || 0}</p>
                    <p className="text-xs text-gray-500">Awaiting delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserPlus className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{mailStats?.total_subscribers || 0}</p>
                    <p className="text-xs text-gray-500">Email list size</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">API Status</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Database</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Email Service</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Storage</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  75% Used
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Uptime</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  99.9%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <Newspaper className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New article published</p>
                    <p className="text-xs text-gray-500">&quot;Breaking News: Latest Updates&quot;</p>
                  </div>
                  <Badge variant="secondary">2 min ago</Badge>
                </div>
                <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <Calendar className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Show scheduled</p>
                    <p className="text-xs text-gray-500">&quot;Morning Show - Tomorrow 8:00 AM&quot;</p>
                  </div>
                  <Badge variant="secondary">1 hour ago</Badge>
                </div>
                <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <Building2 className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New client added</p>
                    <p className="text-xs text-gray-500">&quot;ABC Corporation&quot;</p>
                  </div>
                  <Badge variant="secondary">3 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Status</span>
                          <Badge className="bg-red-500 text-white">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <Badge className="bg-red-500 text-white">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service</span>
                  <Badge className="bg-red-500 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage</span>
                  <Badge className="bg-red-500 text-white">75% Used</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}