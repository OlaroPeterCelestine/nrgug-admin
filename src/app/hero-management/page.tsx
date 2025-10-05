'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, RefreshCw } from 'lucide-react'
import { newsApi } from '@/lib/api'

interface NewsArticle {
  id: number
  title: string
  story: string
  image?: string
  timestamp: string
  author?: string
  category?: string
}

interface HeroSelection {
  mainStory: number | null
  minorStory1: number | null
  minorStory2: number | null
}

export default function HeroManagement() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [heroSelection, setHeroSelection] = useState<HeroSelection>({
    mainStory: null,
    minorStory1: null,
    minorStory2: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchArticles()
    loadHeroSelection()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await newsApi.getAll()
      setArticles(response.data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      setMessage('Error fetching articles')
    } finally {
      setLoading(false)
    }
  }

  const loadHeroSelection = async () => {
    try {
      const response = await fetch('https://nrgug-api-production.up.railway.app/api/hero-selection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (response.ok) {
        const data = await response.json()
        setHeroSelection({
          mainStory: data.main_story?.id || null,
          minorStory1: data.minor_story_1?.id || null,
          minorStory2: data.minor_story_2?.id || null,
        })
      }
    } catch (error) {
      console.error('Error loading hero selection:', error)
    }
  }

  const saveHeroSelection = async () => {
    try {
      setSaving(true)
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
      })

      if (response.ok) {
        setMessage('Hero selection saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error saving hero selection')
      }
    } catch (error) {
      console.error('Error saving hero selection:', error)
      setMessage('Error saving hero selection')
    } finally {
      setSaving(false)
    }
  }

  const getSelectedArticle = (id: number | null) => {
    return articles.find(article => article.id === id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Management</h1>
          <p className="text-gray-600">Select which stories appear in the hero section</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchArticles} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveHeroSelection} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Selection
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

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
                {articles.map((article) => (
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
                {articles.map((article) => (
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
                {articles.map((article) => (
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
    </div>
  )
}
