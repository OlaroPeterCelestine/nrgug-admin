'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Mail, User, Calendar, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { MailLogWithDetails, MailStats } from '@/types';
import { fastApi } from '@/lib/api';

export default function MailLogPage() {
  const [mailLog, setMailLog] = useState<MailLogWithDetails[]>([]);
  const [mailStats, setMailStats] = useState<MailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMailLog();
    fetchMailStats();
  }, []);

  const fetchMailLog = async () => {
    try {
      const response = await fastApi.mailLogs.getAll();
      setMailLog(response.data);
    } catch (error) {
      console.error('Failed to fetch mail log:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMailStats = async () => {
    try {
      const response = await fastApi.mailLogs.getStats();
      setMailStats(response.data);
    } catch (error) {
      console.error('Failed to fetch mail stats:', error);
    }
  };

  const filteredMailLog = mailLog?.filter(item =>
    item.subscriber_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mail_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subscriber_name && item.subscriber_name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mail Log</h1>
          <p className="text-gray-600">Track email delivery and performance</p>
        </div>

        {/* Stats */}
        {mailStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-bg-red-100 rounded-full">
                    <Mail className="h-6 w-6 text-bg-red-1000" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Emails</p>
                    <p className="text-2xl font-bold text-gray-900">{mailStats.total_emails}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sent Emails</p>
                    <p className="text-2xl font-bold text-gray-900">{mailStats.sent_emails}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-50 rounded-full">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{mailStats.pending_emails}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-full">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{mailStats.total_subscribers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search mail logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mail Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Delivery Log ({filteredMailLog.length})</CardTitle>
            <CardDescription>Track all email deliveries and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Email Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMailLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {log.subscriber_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">{log.subscriber_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{log.mail_subject}</p>
                        <p className="text-sm text-gray-500">Mail ID: {log.mail_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Delivered
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(log.sent_at).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        <p>Log ID: {log.id}</p>
                        <p>Subscriber ID: {log.subscriber_id}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredMailLog.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mail logs found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No mail logs match your search criteria.' : 'No emails have been sent yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
