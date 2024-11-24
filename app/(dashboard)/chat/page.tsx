"use client"

import { useEffect, useState } from "react"
import { Room, RoomEvent, VideoPresets } from "livekit-client"
import { VideoChat } from "@/components/video-chat/video-chat"
import { ChatSidebar } from "@/components/video-chat/chat-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Loader2, Video, VideoOff, Mic, MicOff } from "lucide-react"
import { textToSpeech } from "@/app/actions/tts"

export default function ChatPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [aiMessageToSpeak, setAiMessageToSpeak] = useState('');
  const [audioToSpeak, setAudioToSpeak] = useState<any>(null);

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        setIsConnecting(true)
        // In production, fetch token from your API
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        })

        room.on(RoomEvent.Connected, () => {
          console.log("connected to room")
        })

        room.on(RoomEvent.Disconnected, () => {
          console.log("disconnected from room")
        })

        setRoom(room)
      } catch (error) {
        console.error("Error connecting to room:", error)
      } finally {
        setIsConnecting(false)
      }
    }

    connectToRoom()

    return () => {
      room?.disconnect()
    }
  }, [])

  const toggleCamera = () => {
    setIsCameraEnabled(!isCameraEnabled)
    // Implement camera toggle logic
  }

  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled)
    if (room) {
      room.localParticipant?.setMicrophoneEnabled(!isMicEnabled)
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
    setAiMessageToSpeak(msg);
    const audioToSpeak = await textToSpeech(msg);
    setAudioToSpeak(audioToSpeak);
  }

  const handleAudioProcessed = () => {
    setAiMessageToSpeak('');
    setAudioToSpeak(null);
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <DashboardHeader
        heading="Video Chat"
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

      <div className="grid h-full gap-4 md:grid-cols-[1fr,300px]">
        <VideoChat 
          audioToSpeak={audioToSpeak} 
          handleAudioProcessed={handleAudioProcessed}
          isMicEnabled={isMicEnabled}
        />
        <ChatSidebar onNewMessage={handleNewAIMessage} />
      </div>
    </div>
  )
}
