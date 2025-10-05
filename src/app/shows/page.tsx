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
import { Plus, Search, Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';
import { Show, ShowRequest } from '@/types';
import { showsApi } from '@/lib/api';
import { ImageUpload } from '@/components/forms';

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [deletingShow, setDeletingShow] = useState<Show | null>(null);
  const [formData, setFormData] = useState<ShowRequest>({
    hosts: '',
    time_from: '',
    time_to: '',
    image: '',
  });

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const response = await showsApi.getAll();
      setShows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch shows:', error);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert time-only values to full datetime (using today's date)
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const submitData = {
        ...formData,
        time_from: formData.time_from ? `${today}T${formData.time_from}:00Z` : '',
        time_to: formData.time_to ? `${today}T${formData.time_to}:00Z` : '',
      };

      if (editingShow) {
        await showsApi.update(editingShow.id, submitData);
      } else {
        await showsApi.create(submitData);
      }
      await fetchShows();
      setIsDialogOpen(false);
      setEditingShow(null);
      setFormData({ hosts: '', time_from: '', time_to: '', image: '' });
    } catch (error) {
      console.error('Failed to save show:', error);
    }
  };

  const handleEdit = (item: Show) => {
    setEditingShow(item);
    setFormData({
      hosts: item.hosts,
      time_from: new Date(item.time_from).toTimeString().slice(0, 5), // Extract HH:MM from time
      time_to: new Date(item.time_to).toTimeString().slice(0, 5), // Extract HH:MM from time
      image: item.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await showsApi.delete(id);
      await fetchShows();
      setDeletingShow(null);
    } catch (error) {
      console.error('Failed to delete show:', error);
    }
  };

  const filteredShows = shows?.filter(item =>
    item.hosts.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Shows Management</h1>
            <p className="text-gray-600">Schedule and manage shows</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingShow(null);
                setFormData({ hosts: '', time_from: '', time_to: '', image: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Show
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingShow ? 'Edit Show' : 'Schedule Show'}
                </DialogTitle>
                <DialogDescription>
                  {editingShow ? 'Update the show details' : 'Create a new show schedule'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hosts">Hosts</Label>
                  <Input
                    id="hosts"
                    value={formData.hosts}
                    onChange={(e) => setFormData({ ...formData, hosts: e.target.value })}
                    placeholder="Enter host names"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time_from">Start Time</Label>
                    <Input
                      id="time_from"
                      type="time"
                      value={formData.time_from}
                      onChange={(e) => setFormData({ ...formData, time_from: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time_to">End Time</Label>
                    <Input
                      id="time_to"
                      type="time"
                      value={formData.time_to}
                      onChange={(e) => setFormData({ ...formData, time_to: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Show Image"
                  placeholder="Upload an image or enter URL"
                  uploadType="shows"
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingShow ? 'Update' : 'Schedule'} Show
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search shows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Shows Table */}
        <Card>
          <CardHeader>
            <CardTitle>Shows ({filteredShows.length})</CardTitle>
            <CardDescription>Manage all scheduled shows</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show</TableHead>
                  <TableHead>Hosts</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.hosts}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">Show #{item.id}</p>
                          <p className="text-sm text-gray-500">
                            {item.hosts}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        {item.hosts}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(item.time_from)} - {formatTime(item.time_to)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isUpcoming(item.time_from) ? "default" : "secondary"}
                        className={isUpcoming(item.time_from) ? "bg-green-100 text-green-800" : ""}
                      >
                        {isUpcoming(item.time_from) ? 'Upcoming' : 'Past'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingShow(item)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Show</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the show &quot;{deletingShow?.hosts}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
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
