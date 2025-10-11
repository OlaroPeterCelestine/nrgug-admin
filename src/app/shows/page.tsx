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
    show_name: '',
    presenters: '',
    time: '',
    day_of_week: '',
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
      const submitData = {
        ...formData,
      };

      if (editingShow) {
        await showsApi.update(editingShow.id, submitData);
      } else {
        await showsApi.create(submitData);
      }
      await fetchShows();
      setIsDialogOpen(false);
      setEditingShow(null);
      setFormData({ show_name: '', presenters: '', time: '', day_of_week: '', image: '' });
    } catch (error) {
      console.error('Failed to save show:', error);
    }
  };

  const handleEdit = (item: Show) => {
    setEditingShow(item);
    setFormData({
      show_name: item.show_name,
      presenters: item.presenters,
      time: item.time,
      day_of_week: item.day_of_week,
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
    item.show_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.presenters.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Get current day and create day order starting from today
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Create day order starting from current day
    const dayOrder = []
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7
      dayOrder.push(dayNames[dayIndex])
    }
    
    const aDayIndex = dayOrder.indexOf(a.day_of_week)
    const bDayIndex = dayOrder.indexOf(b.day_of_week)
    
    if (aDayIndex !== bDayIndex) {
      return aDayIndex - bDayIndex
    }
    
    // Then sort by start time within the same day
    const aStartTime = a.time.split(' - ')[0]
    const bStartTime = b.time.split(' - ')[0]
    return aStartTime.localeCompare(bStartTime)
  }) || [];

  // Time is now provided directly from API

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
                setFormData({ show_name: '', presenters: '', time: '', day_of_week: '', image: '' });
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
                  <Label htmlFor="show_name">Show Name</Label>
                  <Input
                    id="show_name"
                    value={formData.show_name}
                    onChange={(e) => setFormData({ ...formData, show_name: e.target.value })}
                    placeholder="Enter show name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presenters">Presenters</Label>
                  <Input
                    id="presenters"
                    value={formData.presenters}
                    onChange={(e) => setFormData({ ...formData, presenters: e.target.value })}
                    placeholder="Enter presenter names"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time Range</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 14:00 - 16:00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Day of Week</Label>
                  <Select value={formData.day_of_week} onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <TableHead>Show Name</TableHead>
                  <TableHead>Presenters</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Day</TableHead>
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
                            alt={item.presenters}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">Show #{item.id}</p>
                          <p className="text-sm text-gray-500">
                            {item.show_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm font-medium">
                        {item.show_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        {item.presenters}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className={item.day_of_week === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'font-bold text-blue-600' : ''}>
                          {item.day_of_week}
                        </span>
                        {item.day_of_week === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && (
                          <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Active
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
                                Are you sure you want to delete the show &quot;{deletingShow?.presenters}&quot;? This action cannot be undone.
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
