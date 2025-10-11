'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Eye, 
  Trash2, 
  Clock, 
  Shield, 
  Mail, 
  Phone, 
  Activity,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Monitor
} from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/contexts/auth-context';

interface UserSession {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  sessionToken: string;
  lastActivity: number;
  createdAt: number;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export default function SessionsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<UserSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<UserSession | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration - in real app, this would come from API
  const mockSessions: UserSession[] = [
    {
      id: 'session_1',
      userId: 1,
      userName: 'Albert Admin',
      userEmail: 'albert@nrgug.com',
      userRole: 'Admin',
      sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      lastActivity: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      isActive: true,
      deviceInfo: {
        browser: 'Chrome',
        os: 'macOS',
        device: 'Desktop'
      }
    },
    {
      id: 'session_2',
      userId: 2,
      userName: 'John Doe',
      userEmail: 'john@nrgug.com',
      userRole: 'Tech',
      sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      lastActivity: Date.now() - 15 * 60 * 1000, // 15 minutes ago
      createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      isActive: true,
      deviceInfo: {
        browser: 'Firefox',
        os: 'Windows',
        device: 'Desktop'
      }
    },
    {
      id: 'session_3',
      userId: 3,
      userName: 'Jane Smith',
      userEmail: 'jane@nrgug.com',
      userRole: 'Digital',
      sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      lastActivity: Date.now() - 45 * 60 * 1000, // 45 minutes ago
      createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      isActive: false,
      deviceInfo: {
        browser: 'Safari',
        os: 'iOS',
        device: 'Mobile'
      }
    }
  ];

  useEffect(() => {
    fetchSessions();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSessions, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // const response = await sessionsApi.getAll();
      // setSessions(response.data || []);
      
      // For now, use mock data
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (session: UserSession) => {
    setViewingSession(session);
    setIsViewDialogOpen(true);
  };

  const handleTerminate = async (sessionId: string) => {
    try {
      // In a real app, this would be an API call
      // await sessionsApi.terminate(sessionId);
      
      // For now, just remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setDeletingSession(null);
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const handleTerminateAll = async () => {
    try {
      // In a real app, this would be an API call
      // await sessionsApi.terminateAll();
      
      // For now, just clear all sessions
      setSessions([]);
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress?.includes(searchTerm) ||
      session.deviceInfo?.browser?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && session.isActive) ||
      (filterStatus === 'inactive' && !session.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : XCircle;
  };

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDuration = (createdAt: number) => {
    const now = Date.now();
    const diff = now - createdAt;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate statistics
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.isActive).length;
  const inactiveSessions = sessions.filter(s => !s.isActive).length;
  const uniqueUsers = new Set(sessions.map(s => s.userId)).size;

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'Admin';

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access session management.
            </p>
            <p className="text-sm text-gray-500">
              Only administrators can view and manage user sessions.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Sessions</h1>
            <p className="text-gray-600">Monitor and manage active user sessions</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchSessions}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Auto Refresh
            </Button>
            {sessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminate All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Terminate All Sessions</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to terminate all active sessions? This will log out all users.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleTerminateAll}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Terminate All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{activeSessions}</p>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold">{inactiveSessions}</p>
                  <p className="text-sm text-gray-600">Inactive Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{uniqueUsers}</p>
                  <p className="text-sm text-gray-600">Unique Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions ({filteredSessions.length})</CardTitle>
            <CardDescription>Monitor user activity and manage sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => {
                  const StatusIcon = getStatusIcon(session.isActive);
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {session.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-gray-500">{session.userEmail}</p>
                            <Badge variant="outline" className="text-xs">
                              {session.userRole}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.isActive)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {session.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Monitor className="h-4 w-4 mr-1 text-gray-400" />
                            {session.deviceInfo?.device || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.deviceInfo?.browser} on {session.deviceInfo?.os}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatLastActivity(session.lastActivity)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDuration(session.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {session.ipAddress || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(session)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeletingSession(session)}
                                title="Terminate Session"
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Terminate Session</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to terminate the session for "{session.userName}"? 
                                  This will log them out immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleTerminate(session.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Terminate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Session Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
              <DialogDescription>
                Detailed information about this user session
              </DialogDescription>
            </DialogHeader>
            {viewingSession && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">
                      {viewingSession.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{viewingSession.userName}</h3>
                    <p className="text-gray-600">{viewingSession.userEmail}</p>
                    <Badge className={getStatusColor(viewingSession.isActive)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {viewingSession.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Session Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Last Activity</p>
                          <p className="font-medium">{formatLastActivity(viewingSession.lastActivity)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Session Duration</p>
                          <p className="font-medium">{formatDuration(viewingSession.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">IP Address</p>
                          <p className="font-medium font-mono">{viewingSession.ipAddress || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Device Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Device Type</p>
                          <p className="font-medium">{viewingSession.deviceInfo?.device || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Browser</p>
                          <p className="font-medium">{viewingSession.deviceInfo?.browser || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Operating System</p>
                          <p className="font-medium">{viewingSession.deviceInfo?.os || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Agent */}
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">User Agent</h4>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm font-mono break-all">
                      {viewingSession.userAgent || 'Not available'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleTerminate(viewingSession.id);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminate Session
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
