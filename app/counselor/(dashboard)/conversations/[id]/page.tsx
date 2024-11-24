"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { ConversationDetails } from "@/components/admin/conversation-details";
import { Button } from "@/components/ui/button";

interface ChatSession {
  id: string;
  studentId: string;
  communicationMode: string;
  category: string;
  startTime: string;
  endTime: string | null;
  summary: string | null;
  status: string;
  user?: {
    fullName: string;
    email: string;
  };
  assignment?: {
    counselorId: string | null;
    status: string;
  };
}

export default function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const [conversation, setConversation] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch conversation");
        }
        const data = await response.json();
        setConversation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [params.id]);

  const handleAssign = async () => {
    try {
      const response = await fetch('/api/assignments/counselor/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign conversation');
      }

      // Refresh the page or update UI as needed
      window.location.reload();
    } catch (error) {
      console.error('Error assigning conversation:', error);
      // Handle error (you might want to show a toast notification)
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  if (error || !conversation) {
    return <div>Error: {error || "Conversation not found"}</div>;
  }
  

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Conversation Details"
          text={`Viewing conversation with ${
            conversation.user?.fullName || "Unknown"
          }`}
        />
        {(!conversation.assignment?.counselorId) && (
          <Button onClick={handleAssign}>Self Assign</Button>
        )}
      </div>
      <ConversationDetails conversation={conversation} />
    </DashboardShell>
  );
}
