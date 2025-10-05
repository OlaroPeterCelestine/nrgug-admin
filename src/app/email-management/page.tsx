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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  MailCheck,
  BarChart3
} from 'lucide-react';
import { 
  Subscriber, 
  SubscriberRequest, 
  MailQueue, 
  MailQueueRequest, 
  MailLogWithDetails,
  MailStats 
} from '@/types';
import { subscribersApi, mailQueueApi, fastApi } from '@/lib/api';
import { ImageUpload } from '@/components/forms';

export default function EmailManagementPage() {
  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscriberLoading, setSubscriberLoading] = useState(true);
  const [subscriberSearchTerm, setSubscriberSearchTerm] = useState('');
  const [isSubscriberDialogOpen, setIsSubscriberDialogOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [deletingSubscriber, setDeletingSubscriber] = useState<Subscriber | null>(null);
  const [subscriberFormData, setSubscriberFormData] = useState<SubscriberRequest>({
    name: '',
    email: '',
    subscribed: true,
  });

  // Mail Queue state
  const [mailQueue, setMailQueue] = useState<MailQueue[]>([]);
  const [mailQueueLoading, setMailQueueLoading] = useState(true);
  const [mailQueueSearchTerm, setMailQueueSearchTerm] = useState('');
  const [isMailQueueDialogOpen, setIsMailQueueDialogOpen] = useState(false);
  const [editingMail, setEditingMail] = useState<MailQueue | null>(null);
  const [deletingMail, setDeletingMail] = useState<MailQueue | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [mailQueueFormData, setMailQueueFormData] = useState<MailQueueRequest>({
    subject: '',
    body: '',
    image: '',
  });

  // Mail Log state
  const [mailLogs, setMailLogs] = useState<MailLogWithDetails[]>([]);
  const [mailLogLoading, setMailLogLoading] = useState(true);
  const [mailLogSearchTerm, setMailLogSearchTerm] = useState('');
  const [mailStats, setMailStats] = useState<MailStats | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('subscribers');

  useEffect(() => {
    fetchSubscribers();
    fetchMailQueue();
    fetchMailLogs();
    fetchMailStats();
  }, []);

  // Subscribers functions
  const fetchSubscribers = async () => {
    try {
      const response = await subscribersApi.getAll();
      setSubscribers(response.data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setSubscriberLoading(false);
    }
  };

  const handleSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubscriber) {
        await subscribersApi.update(editingSubscriber.id, subscriberFormData);
      } else {
        await subscribersApi.create(subscriberFormData);
      }
      await fetchSubscribers();
      setIsSubscriberDialogOpen(false);
      setEditingSubscriber(null);
      setSubscriberFormData({ name: '', email: '', subscribed: true });
    } catch (error) {
      console.error('Failed to save subscriber:', error);
    }
  };

  const handleSubscriberEdit = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setSubscriberFormData({
      name: subscriber.name || '',
      email: subscriber.email,
      subscribed: subscriber.subscribed,
    });
    setIsSubscriberDialogOpen(true);
  };

  const handleSubscriberDelete = async (id: number) => {
    try {
      await subscribersApi.delete(id);
      await fetchSubscribers();
      setDeletingSubscriber(null);
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
    }
  };

  // Mail Queue functions
  const fetchMailQueue = async () => {
    try {
      const response = await mailQueueApi.getAll();
      setMailQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch mail queue:', error);
    } finally {
      setMailQueueLoading(false);
    }
  };

  const handleMailQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMail) {
        await mailQueueApi.update(editingMail.id, mailQueueFormData);
      } else {
        await mailQueueApi.create(mailQueueFormData);
      }
      await fetchMailQueue();
      setIsMailQueueDialogOpen(false);
      setEditingMail(null);
      setMailQueueFormData({ subject: '', body: '', image: '' });
    } catch (error) {
      console.error('Failed to save mail:', error);
    }
  };

  const handleMailQueueEdit = (item: MailQueue) => {
    setEditingMail(item);
    setMailQueueFormData({
      subject: item.subject,
      body: item.body,
      image: item.image || '',
    });
    setIsMailQueueDialogOpen(true);
  };

  const handleMailQueueDelete = async (id: number) => {
    try {
      await mailQueueApi.delete(id);
      await fetchMailQueue();
      setDeletingMail(null);
    } catch (error) {
      console.error('Failed to delete mail:', error);
    }
  };

  const handleSendEmail = async (id: number) => {
    setSendingEmail(id);
    try {
      await mailQueueApi.sendEmail(id);
      await fetchMailQueue();
      await fetchMailLogs();
      await fetchMailStats();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSendingEmail(null);
    }
  };

  // Mail Log functions
  const fetchMailLogs = async () => {
    try {
      const response = await fastApi.mailLogs.getAll();
      setMailLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch mail logs:', error);
    } finally {
      setMailLogLoading(false);
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

  // Filter functions
  const filteredSubscribers = subscribers?.filter(subscriber =>
    subscriber.name?.toLowerCase().includes(subscriberSearchTerm.toLowerCase()) ||
    subscriber.email.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
  ) || [];

  const filteredMailQueue = mailQueue?.filter(mail =>
    mail.subject.toLowerCase().includes(mailQueueSearchTerm.toLowerCase()) ||
    mail.body.toLowerCase().includes(mailQueueSearchTerm.toLowerCase())
  ) || [];

  const filteredMailLogs = mailLogs?.filter(log =>
    log.mail_subject.toLowerCase().includes(mailLogSearchTerm.toLowerCase()) ||
    log.subscriber_email.toLowerCase().includes(mailLogSearchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">Manage subscribers, email campaigns, and delivery logs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
                </div>
                <Users className="h-8 w-8 text-bg-red-1000" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscribers?.filter(s => s.subscribed).length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Queue</p>
                  <p className="text-2xl font-bold text-gray-900">{mailQueue.length}</p>
                </div>
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mailStats?.total_sent || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscribers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="mail-queue" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Mail Queue
            </TabsTrigger>
            <TabsTrigger value="mail-log" className="flex items-center gap-2">
              <MailCheck className="h-4 w-4" />
              Mail Log
            </TabsTrigger>
          </TabsList>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            {/* Subscribers Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={() => setIsSubscriberDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
            </div>

            {/* Subscribers Dialog */}
            <Dialog open={isSubscriberDialogOpen} onOpenChange={setIsSubscriberDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSubscriber ? 'Update subscriber details' : 'Add a new email subscriber'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubscriberSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={subscriberFormData.name}
                      onChange={(e) => setSubscriberFormData({ ...subscriberFormData, name: e.target.value })}
                      placeholder="Enter subscriber name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={subscriberFormData.email}
                      onChange={(e) => setSubscriberFormData({ ...subscriberFormData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSubscriberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSubscriber ? 'Update' : 'Create'} Subscriber
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Subscribers Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search subscribers..."
                    value={subscriberSearchTerm}
                    onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Subscribers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Subscribers</CardTitle>
                <CardDescription>Manage email subscribers and their preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">
                          {subscriber.name || 'N/A'}
                        </TableCell>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>
                          <Badge variant={subscriber.subscribed ? 'default' : 'secondary'}>
                            {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subscriber.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSubscriberEdit(subscriber)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this subscriber? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleSubscriberDelete(subscriber.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mail Queue Tab */}
          <TabsContent value="mail-queue" className="space-y-6">
            {/* Mail Queue Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={() => setIsMailQueueDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Email
              </Button>
            </div>

            {/* Mail Queue Dialog */}
            <Dialog open={isMailQueueDialogOpen} onOpenChange={setIsMailQueueDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingMail ? 'Edit Email' : 'Create Email'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMail ? 'Update email details' : 'Create a new email campaign'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMailQueueSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={mailQueueFormData.subject}
                      onChange={(e) => setMailQueueFormData({ ...mailQueueFormData, subject: e.target.value })}
                      placeholder="Enter email subject"
                      required
                    />
                  </div>
                  <ImageUpload
                    value={mailQueueFormData.image}
                    onChange={(url) => setMailQueueFormData({ ...mailQueueFormData, image: url })}
                    label="Email Image (Optional)"
                    placeholder="Upload an image or enter URL"
                    uploadType="mail"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="body">Email Body</Label>
                    <Textarea
                      id="body"
                      value={mailQueueFormData.body}
                      onChange={(e) => setMailQueueFormData({ ...mailQueueFormData, body: e.target.value })}
                      placeholder="Enter email content (HTML supported)"
                      rows={8}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsMailQueueDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingMail ? 'Update' : 'Create'} Email
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Mail Queue Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search emails..."
                    value={mailQueueSearchTerm}
                    onChange={(e) => setMailQueueSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mail Queue Table */}
            <Card>
              <CardHeader>
                <CardTitle>Email Queue</CardTitle>
                <CardDescription>Manage email campaigns and send status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMailQueue.map((mail) => (
                      <TableRow key={mail.id}>
                        <TableCell className="font-medium">{mail.subject}</TableCell>
                        <TableCell>
                          {mail.image ? (
                            <img
                              src={mail.image}
                              alt="Email image"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={mail.sent ? 'default' : 'secondary'}>
                            {mail.sent ? 'Sent' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(mail.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMailQueueEdit(mail)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!mail.sent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendEmail(mail.id)}
                                disabled={sendingEmail === mail.id}
                              >
                                {sendingEmail === mail.id ? (
                                  <Clock className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Email</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this email? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleMailQueueDelete(mail.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mail Log Tab */}
          <TabsContent value="mail-log" className="space-y-6">
            {/* Mail Log Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mail logs..."
                    value={mailLogSearchTerm}
                    onChange={(e) => setMailLogSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mail Log Table */}
            <Card>
              <CardHeader>
                <CardTitle>Email Delivery Log</CardTitle>
                <CardDescription>Track email delivery status and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.subscriber_name || 'N/A'}
                        </TableCell>
                        <TableCell>{log.subscriber_email}</TableCell>
                        <TableCell>{log.mail_subject}</TableCell>
                        <TableCell>
                          {new Date(log.sent_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Delivered
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
