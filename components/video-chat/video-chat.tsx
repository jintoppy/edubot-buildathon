"use client"

import { Room } from "livekit-client"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface VideoChatProps {
  room: Room | null
}

export function VideoChat({ room }: VideoChatProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="relative flex-1 bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src="/ai-counselor.png" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">AI Counselor</h3>
            <p className="text-sm text-muted-foreground">
              Educational Guidance Expert
            </p>
          </div>
        </div>
        {/* Video elements will be inserted here by LiveKit */}
        <div id="video-container" className="h-full" />
      </div>
    </Card>
  )
}