"use client"

import { useEffect, useRef, useState } from "react"
import { VideoChat } from "@/components/video-chat/video-chat"
import { ChatSidebar } from "@/components/video-chat/chat-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Loader2, Video, VideoOff, Mic, MicOff } from "lucide-react"
import { textToSpeech } from "@/app/actions/tts"

export default function ChatPage() {
  const chatSidebarRef = useRef<any>(null);
  
  const handleNewMessage = (message: any) => {
    if (chatSidebarRef.current) {
      chatSidebarRef.current.addMessage(message);
    }
  };
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [aiMessageToSpeak, setAiMessageToSpeak] = useState('');
  const [audioToSpeak, setAudioToSpeak] = useState<any>(null);

  const toggleCamera = () => {
    setIsCameraEnabled(!isCameraEnabled)
    // Implement camera toggle logic
  }

  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled)

    // Setup speech recognition when mic is enabled
    if (!isMicEnabled) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        
        if (event.results[last].isFinal) {
          const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            createdAt: new Date(),
          };
          handleNewMessage(userMessage);
        }
      };
      
      recognition.start();
      
      // Store recognition instance for cleanup
      (window as any).currentRecognition = recognition;
    } else {
      // Stop recognition when mic is disabled
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
    }
  }

  if (isConnecting) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting to video chat...</p>
        </div>
      </div>
    )
  }

  const handleNewAIMessage = async (msg: string) => {
    console.log('handleNewAIMessage', msg);
    setAiMessageToSpeak(msg);
    const audioToSpeak = await textToSpeech(msg);
    if(audioToSpeak && audioToSpeak.success){
      setAudioToSpeak(audioToSpeak.audioData);
    }
  }

  

  const handleAudioProcessed = () => {
    setAiMessageToSpeak('');
    setAudioToSpeak(null);
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="grid h-full gap-4 md:grid-cols-[512px,1fr]">
        <VideoChat 
          audioToSpeak={audioToSpeak} 
          handleAudioProcessed={handleAudioProcessed}
          isMicEnabled={isMicEnabled}
        />
        <ChatSidebar 
          onNewMessage={handleNewAIMessage}
          ref={chatSidebarRef} 
        />
      </div>
      
      <DashboardHeader
        heading="AI Counselor"
        text="Have a conversation with your AI counselor"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            className={!isCameraEnabled ? "bg-muted" : ""}
          >
            {isCameraEnabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMic}
            className={!isMicEnabled ? "bg-muted" : ""}
          >
            {isMicEnabled ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DashboardHeader>
    </div>
  )
}
