"use client";

import { Room } from "livekit-client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimliClient } from "simli-client";
import { useEffect, useRef, useState } from "react";

interface VideoChatProps {
  audioToSpeak: any;
  handleAudioProcessed: () => void;
  isMicEnabled?: boolean;
}

export function VideoChat({
  audioToSpeak,
  handleAudioProcessed,
  isMicEnabled = false,
}: VideoChatProps) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
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

  // Handle microphone access
  useEffect(() => {
    const setupMicrophone = async () => {
      try {
        if (isMicEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaStream(stream);
        } else {
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
          }
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    setupMicrophone();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMicEnabled]);

  // Handle audio processing
  useEffect(() => {
    if (!mediaStream || !isMicEnabled) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert Float32Array to Int16Array for compatibility
      const audioData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        audioData[i] = inputData[i] * 32767;
      }
      
      if (simliClientRef.current) {
        simliClientRef.current.sendAudioData(new Uint8Array(audioData.buffer));
      }
    };

    return () => {
      processor.disconnect();
      source.disconnect();
      audioContext.close();
    };
  }, [mediaStream, isMicEnabled]);

  // Handle AI speech
  useEffect(() => {
    if (audioToSpeak && !isMicEnabled) {
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
