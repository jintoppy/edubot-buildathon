"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export function ChatSidebar() {
  const { toast } = useToast();
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading, setMessages } =
  useChat({
    initialMessages: [{id: 'init1', content: `Hello! I'm your AI educational counselor. How can I help you today?`, role: 'assistant'}],
    onResponse(response) {
      console.log(response);
      // const sourcesHeader = response.headers.get("x-sources");
      // const sources = sourcesHeader ? JSON.parse((Buffer.from(sourcesHeader, 'base64')).toString('utf8')) : [];
      // const messageIndexHeader = response.headers.get("x-message-index");
      // if (sources.length && messageIndexHeader !== null) {
      //   setSourcesForMessages({...sourcesForMessages, [messageIndexHeader]: sources});
      // }
    },
    onError: (e) => {
      toast({description: e.message});
    }
  });
  // const [messages, setMessages] = useState<Message[]>([
  //   {
  //     id: 1,
  //     content: "Hello! I'm your AI educational counselor. How can I help you today?",
  //     sender: "ai",
  //     timestamp: new Date(),
  //   },
  // ])

  const handleSend = (e:any) => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    handleSubmit(e);

    // setMessages([...messages, newMessage])
    // setInput("")

    // // Simulate AI response
    // setTimeout(() => {
    //   const aiResponse: Message = {
    //     id: messages.length + 2,
    //     content: "I understand you're interested in studying abroad. Could you tell me more about your preferred field of study?",
    //     sender: "ai",
    //     timestamp: new Date(),
    //   }
    //   setMessages((prev) => [...prev, aiResponse])
    // }, 1000)
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {/* {message.createdAt ? message.createdAt?.toLocaleTimeString(): ''} */}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}