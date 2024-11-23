'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  content: string
  messageType: string
  timestamp: string
  userId: string
}

interface ConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation: {
    id: string
    studentId: string
    communicationMode: string
    category: string
    startTime: string
    endTime: string | null
    summary: string | null
    status: string
    user?: {
      fullName: string
      email: string
    }
  }
}

export function ConversationModal({ open, onOpenChange, conversation }: ConversationModalProps) {
  const [messages, setMessages] = React.useState<Message[]>([])

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversation.id}/messages`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    if (conversation.id) {
      fetchMessages()
    }
  }, [conversation.id])
  const duration = conversation.endTime 
    ? new Date(conversation.endTime).getTime() - new Date(conversation.startTime).getTime()
    : null;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conversation Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold">Student</h4>
                  <p>{conversation.user?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{conversation.user?.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Duration</h4>
                  <p>{duration ? formatDuration(duration) : 'Ongoing'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Details</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{conversation.category.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline">{conversation.communicationMode.replace(/_/g, ' ')}</Badge>
                  <Badge 
                    variant={conversation.status === 'active' ? 'default' : 'secondary'}
                  >
                    {conversation.status}
                  </Badge>
                </div>
              </div>

              {conversation.summary && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{conversation.summary}</p>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-semibold">Conversation History</h4>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.messageType === 'user_message' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.messageType === 'user_message'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-semibold">Conversation Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm">Started conversation</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                {conversation.endTime && (
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm">Ended conversation</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
