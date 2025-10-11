'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2, Mail, Eye, Reply, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface ContactMessage {
  id: number
  purpose: string
  name: string
  email: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'closed'
  created_at: string
  updated_at: string
}

interface ContactReply {
  id: number
  contact_message_id: number
  admin_name: string
  admin_email: string
  reply_message: string
  created_at: string
  updated_at: string
}

interface ContactMessageWithReplies extends ContactMessage {
  replies: ContactReply[]
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageWithReplies | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyForm, setReplyForm] = useState({
    admin_name: '',
    admin_email: '',
    reply_message: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [statusFilter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const url = statusFilter && statusFilter !== 'all'
        ? `https://nrgug-api-production.up.railway.app/api/contact?status=${statusFilter}`
        : 'https://nrgug-api-production.up.railway.app/api/contact'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessageWithReplies = async (id: number) => {
    try {
      const response = await fetch(`https://nrgug-api-production.up.railway.app/api/contact/${id}/with-replies`)
      if (response.ok) {
        const data = await response.json()
        setSelectedMessage(data)
      }
    } catch (error) {
      console.error('Error fetching message details:', error)
    }
  }

  const updateMessageStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`https://nrgug-api-production.up.railway.app/api/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchMessages()
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: status as any })
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyForm.admin_name || !replyForm.admin_email || !replyForm.reply_message) {
      return
    }

    try {
      const response = await fetch(`https://nrgug-api-production.up.railway.app/api/contact/${selectedMessage.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_message_id: selectedMessage.id,
          admin_name: replyForm.admin_name,
          admin_email: replyForm.admin_email,
          reply_message: replyForm.reply_message,
        }),
      })

      if (response.ok) {
        setReplyForm({ admin_name: '', admin_email: '', reply_message: '' })
        setReplyDialogOpen(false)
        fetchMessageWithReplies(selectedMessage.id)
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  const deleteMessage = async (id: number) => {
    try {
      const response = await fetch(`https://nrgug-api-production.up.railway.app/api/contact/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMessages()
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null)
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-500'
      case 'read': return 'bg-blue-500'
      case 'replied': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread': return 'Unread'
      case 'read': return 'Read'
      case 'replied': return 'Replied'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading contact messages...</div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-4">
          {messages && messages.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No contact messages found</p>
              </CardContent>
            </Card>
          ) : (
            messages && messages.map((message) => (
              <Card 
                key={message.id} 
                className={`cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id ? 'ring-2 ring-red-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => fetchMessageWithReplies(message.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <p className="text-sm text-gray-600">{message.name} &lt;{message.email}&gt;</p>
                      <p className="text-xs text-gray-500">{message.purpose}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusText(message.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Details */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedMessage.subject}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                    <p className="text-xs text-gray-500">{selectedMessage.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedMessage.status)}>
                      {getStatusText(selectedMessage.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Select 
                    value={selectedMessage.status} 
                    onValueChange={(status) => updateMessageStatus(selectedMessage.id, status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Reply</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin_name">Your Name</Label>
                          <Input
                            id="admin_name"
                            value={replyForm.admin_name}
                            onChange={(e) => setReplyForm({ ...replyForm, admin_name: e.target.value })}
                            placeholder="Admin Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin_email">Your Email</Label>
                          <Input
                            id="admin_email"
                            type="email"
                            value={replyForm.admin_email}
                            onChange={(e) => setReplyForm({ ...replyForm, admin_email: e.target.value })}
                            placeholder="admin@106.5nrgradio.ug"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reply_message">Reply Message</Label>
                          <Textarea
                            id="reply_message"
                            value={replyForm.reply_message}
                            onChange={(e) => setReplyForm({ ...replyForm, reply_message: e.target.value })}
                            placeholder="Type your reply here..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={sendReply}>
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this contact message? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMessage(selectedMessage.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Replies</Label>
                    <div className="space-y-3 mt-2">
                      {selectedMessage.replies.map((reply) => (
                        <div key={reply.id} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium">{reply.admin_name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(reply.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">{reply.reply_message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
