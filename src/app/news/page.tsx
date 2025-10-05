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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Star, Save, RefreshCw } from 'lucide-react';
import { News, NewsRequest } from '@/types';
import { newsApi } from '@/lib/api';
import { ImageUpload } from '@/components/forms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeroSelection {
  mainStory: number | null;
  minorStory1: number | null;
  minorStory2: number | null;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<NewsRequest>({
    title: '',
    story: '',
    author: '',
    category: '',
    image: '',
  });
  
  // Hero management state
  const [heroSelection, setHeroSelection] = useState<HeroSelection>({
    mainStory: null,
    minorStory1: null,
    minorStory2: null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('news');

  useEffect(() => {
    fetchNews();
    loadHeroSelection();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await newsApi.getAll();
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await newsApi.update(editingNews.id, formData);
      } else {
        await newsApi.create(formData);
      }
      await fetchNews();
      setIsDialogOpen(false);
      setEditingNews(null);
      setFormData({ title: '', story: '', author: '', category: '', image: '' });
    } catch (error) {
      console.error('Failed to save news:', error);
    }
  };

  const handleEdit = (item: News) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      story: item.story,
      author: item.author,
      category: item.category,
      image: item.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await newsApi.delete(id);
      await fetchNews();
      setDeletingNews(null);
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const filteredNews = news?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const categories = ['Breaking', 'Sports', 'Politics', 'Entertainment', 'Technology', 'Business'];

  // Hero management functions
  const loadHeroSelection = async () => {
    try {
      const response = await fetch('https://nrgug-api-production.up.railway.app/api/hero-selection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (response.ok) {
        const data = await response.json();
        setHeroSelection({
          mainStory: data.main_story?.id || null,
          minorStory1: data.minor_story_1?.id || null,
          minorStory2: data.minor_story_2?.id || null,
        });
      }
    } catch (error) {
      console.error('Error loading hero selection:', error);
    }
  };

  const saveHeroSelection = async () => {
    try {
      setSaving(true);
      const response = await fetch('https://nrgug-api-production.up.railway.app/api/hero-selection', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          main_story_id: heroSelection.mainStory,
          minor_story_1_id: heroSelection.minorStory1,
          minor_story_2_id: heroSelection.minorStory2,
        }),
      });

      if (response.ok) {
        setMessage('Hero selection saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving hero selection');
      }
    } catch (error) {
      console.error('Error saving hero selection:', error);
      setMessage('Error saving hero selection');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedArticle = (id: number | null) => {
    return news.find(article => article.id === id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600">Manage news articles and hero section content</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              News Articles
            </TabsTrigger>
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Hero Section
            </TabsTrigger>
          </TabsList>

          {/* News Articles Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingNews(null);
                setFormData({ title: '', story: '', author: '', category: '', image: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add News Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? 'Edit News Article' : 'Add News Article'}
                </DialogTitle>
                <DialogDescription>
                  {editingNews ? 'Update the news article details' : 'Create a new news article'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter article title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Article Image"
                  placeholder="Upload an image or enter URL"
                  uploadType="news"
                />
                <div className="space-y-2">
                  <Label htmlFor="story">Story</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    placeholder="Enter article content"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNews ? 'Update' : 'Create'} Article
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
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* News Table - Hidden on mobile */}
        <Card className="hidden sm:block">
          <CardHeader>
            <CardTitle>News Articles ({filteredNews.length})</CardTitle>
            <CardDescription>Manage all news articles and content</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredNews.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.story.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
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
                              onClick={() => setDeletingNews(item)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete News Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{deletingNews?.title}&quot;? This action cannot be undone.
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

        {/* Mobile Card Layout - Hidden on larger screens */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {item.story.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{item.author}</span>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingNews(item)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete News Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{deletingNews?.title}&quot;? This action cannot be undone.
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
          </TabsContent>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Hero Section Management</h2>
                <p className="text-gray-600">Select which stories appear in the hero section</p>
              </div>
              <Button onClick={saveHeroSelection} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Selection
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Story Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Main Story</CardTitle>
                  <CardDescription>Select the featured story for the hero section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={heroSelection.mainStory?.toString() || ''}
                    onValueChange={(value) => setHeroSelection(prev => ({ ...prev, mainStory: value ? parseInt(value) : null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select main story" />
                    </SelectTrigger>
                    <SelectContent>
                      {news.map((article) => (
                        <SelectItem key={article.id} value={article.id.toString()}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {heroSelection.mainStory && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{getSelectedArticle(heroSelection.mainStory)?.category || 'No category'}</Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(getSelectedArticle(heroSelection.mainStory)?.timestamp || '')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {getSelectedArticle(heroSelection.mainStory)?.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {getSelectedArticle(heroSelection.mainStory)?.story}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Minor Story 1 Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Minor Story 1</CardTitle>
                  <CardDescription>Select the first minor story</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={heroSelection.minorStory1?.toString() || ''}
                    onValueChange={(value) => setHeroSelection(prev => ({ ...prev, minorStory1: value ? parseInt(value) : null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select minor story 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {news.map((article) => (
                        <SelectItem key={article.id} value={article.id.toString()}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {heroSelection.minorStory1 && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{getSelectedArticle(heroSelection.minorStory1)?.category || 'No category'}</Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(getSelectedArticle(heroSelection.minorStory1)?.timestamp || '')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {getSelectedArticle(heroSelection.minorStory1)?.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {getSelectedArticle(heroSelection.minorStory1)?.story}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Minor Story 2 Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Minor Story 2</CardTitle>
                  <CardDescription>Select the second minor story</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={heroSelection.minorStory2?.toString() || ''}
                    onValueChange={(value) => setHeroSelection(prev => ({ ...prev, minorStory2: value ? parseInt(value) : null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select minor story 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {news.map((article) => (
                        <SelectItem key={article.id} value={article.id.toString()}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {heroSelection.minorStory2 && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{getSelectedArticle(heroSelection.minorStory2)?.category || 'No category'}</Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(getSelectedArticle(heroSelection.minorStory2)?.timestamp || '')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {getSelectedArticle(heroSelection.minorStory2)?.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {getSelectedArticle(heroSelection.minorStory2)?.story}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Section Preview</CardTitle>
                <CardDescription>Preview how your selected stories will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Story Preview */}
                  <div className="lg:col-span-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-600">Main Story</Badge>
                        {heroSelection.mainStory && (
                          <Badge variant="secondary">
                            {getSelectedArticle(heroSelection.mainStory)?.category || 'No category'}
                          </Badge>
                        )}
                      </div>
                      {heroSelection.mainStory ? (
                        <div>
                          <h3 className="font-bold text-lg mb-2">
                            {getSelectedArticle(heroSelection.mainStory)?.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatDate(getSelectedArticle(heroSelection.mainStory)?.timestamp || '')}
                          </p>
                          <p className="text-sm line-clamp-3">
                            {getSelectedArticle(heroSelection.mainStory)?.story}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No main story selected</p>
                      )}
                    </div>
                  </div>

                  {/* Minor Stories Preview */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-600">Minor 1</Badge>
                        {heroSelection.minorStory1 && (
                          <Badge variant="secondary">
                            {getSelectedArticle(heroSelection.minorStory1)?.category || 'No category'}
                          </Badge>
                        )}
                      </div>
                      {heroSelection.minorStory1 ? (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            {getSelectedArticle(heroSelection.minorStory1)?.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {getSelectedArticle(heroSelection.minorStory1)?.story}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No minor story 1 selected</p>
                      )}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-600">Minor 2</Badge>
                        {heroSelection.minorStory2 && (
                          <Badge variant="secondary">
                            {getSelectedArticle(heroSelection.minorStory2)?.category || 'No category'}
                          </Badge>
                        )}
                      </div>
                      {heroSelection.minorStory2 ? (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            {getSelectedArticle(heroSelection.minorStory2)?.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {getSelectedArticle(heroSelection.minorStory2)?.story}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No minor story 2 selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
