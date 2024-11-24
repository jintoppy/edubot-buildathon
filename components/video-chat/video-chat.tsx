"use client";

import { Room } from "livekit-client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimliClient } from "simli-client";
import { useEffect, useRef } from "react";

interface VideoChatProps {
  audioToSpeak: any;
  handleAudioProcessed: () => void;
}

export function VideoChat({
  audioToSpeak,
  handleAudioProcessed,
}: VideoChatProps) {
  const isSimliInitialised = useRef(false);
  const simliClientRef = useRef<SimliClient | null>(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && videoRef.current && !isSimliInitialised.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY!,
        faceID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID!,
        handleSilence: true,
        maxSessionLength: 3600, // in seconds
        maxIdleTime: 600, // in seconds
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClientRef.current = new SimliClient();

      simliClientRef.current.Initialize(SimliConfig);

      isSimliInitialised.current = true;

      setTimeout(() => {
        simliClientRef.current?.start();
      }, 4000);

      console.log("Simli Client initialized");
      // const emptyAudioData = new Uint8Array(6000).fill(0);
      // simliClientRef.current.sendAudioData(emptyAudioData);
    }
  }, [audioRef, videoRef, isSimliInitialised]);

  useEffect(() => {
    if (audioToSpeak) {
      const audioArray = new Uint8Array(audioToSpeak);
      console.log("audioArray", audioArray);
      console.log("audioArray length", audioArray.length);
      const chunkSize = 6000;
      for (let i = 0; i < audioArray.length; i += chunkSize) {
        const chunk = audioArray.slice(i, i + chunkSize);
        simliClientRef.current?.sendAudioData(chunk);
      }
      handleAudioProcessed();
    }
  }, [audioToSpeak]);

  return (
    <Card className="flex flex-col h-screen overflow-hidden">
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
        <div id="video-container" className="h-full">
          <video ref={videoRef} autoPlay playsInline></video>
          <audio ref={audioRef} autoPlay></audio>
        </div>
      </div>
    </Card>
  );
}
