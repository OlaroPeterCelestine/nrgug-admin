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
import { Plus, Search, Edit, Trash2, Mail, Send, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { MailQueue, MailQueueRequest } from '@/types';
import { mailQueueApi } from '@/lib/api';
import { ImageUpload } from '@/components/forms';

export default function MailQueuePage() {
  const [mailQueue, setMailQueue] = useState<MailQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMail, setEditingMail] = useState<MailQueue | null>(null);
  const [deletingMail, setDeletingMail] = useState<MailQueue | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [formData, setFormData] = useState<MailQueueRequest>({
    subject: '',
    body: '',
    image: '',
  });

  useEffect(() => {
    fetchMailQueue();
  }, []);

  const fetchMailQueue = async () => {
    try {
      const response = await mailQueueApi.getAll();
      setMailQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch mail queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMail) {
        await mailQueueApi.update(editingMail.id, formData);
      } else {
        await mailQueueApi.create(formData);
      }
      await fetchMailQueue();
      setIsDialogOpen(false);
      setEditingMail(null);
      setFormData({ subject: '', body: '', image: '' });
    } catch (error) {
      console.error('Failed to save mail:', error);
    }
  };

  const handleEdit = (item: MailQueue) => {
    setEditingMail(item);
    setFormData({
      subject: item.subject,
      body: item.body,
      image: item.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
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
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredMail = mailQueue?.filter(item =>
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.body.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sentCount = mailQueue?.filter(m => m.sent).length || 0;
  const pendingCount = mailQueue?.filter(m => !m.sent).length || 0;

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
            <h1 className="text-3xl font-bold text-gray-900">Mail Queue</h1>
            <p className="text-gray-600">Manage bulk email campaigns</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingMail(null);
                setFormData({ subject: '', body: '', image: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMail ? 'Edit Email' : 'Create Email'}
                </DialogTitle>
                <DialogDescription>
                  {editingMail ? 'Update the email details' : 'Create a new bulk email campaign'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    required
                  />
                </div>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Email Image (Optional)"
                  placeholder="Upload an image or enter URL"
                  uploadType="mail"
                />
                <div className="space-y-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Enter email content (HTML supported)"
                    rows={8}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMail ? 'Update' : 'Create'} Email
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-bg-red-100 rounded-full">
                  <Mail className="h-6 w-6 text-bg-red-1000" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">{mailQueue.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{sentCount}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mail Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns ({filteredMail.length})</CardTitle>
            <CardDescription>Manage all bulk email campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMail.map((mail) => (
                  <TableRow key={mail.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {mail.image && (
                          <img
                            src={mail.image}
                            alt={mail.subject}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">Email #{mail.id}</p>
                          <p className="text-sm text-gray-500">
                            {mail.body.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{mail.subject}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={mail.sent ? "default" : "secondary"}
                        className={mail.sent ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                      >
                        {mail.sent ? 'Sent' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(mail.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mail.sent_at ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(mail.sent_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not sent</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!mail.sent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEmail(mail.id)}
                            disabled={sendingEmail === mail.id}
                          >
                            {sendingEmail === mail.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(mail)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingMail(mail)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Email</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{deletingMail?.subject}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(mail.id)}
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
      </div>
    </Layout>
  );
}
