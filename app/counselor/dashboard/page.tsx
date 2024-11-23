import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { AssignmentsTabs } from "@/components/counselor/assignments-tabs";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { and, eq, isNull } from "drizzle-orm";
import { counselorAssignments, users, programs, chatSessions } from "@/lib/db/schema";

async function getCounselorAssignments(counselorId: string) {
  // Get assignments assigned to the counselor
  const myAssignments = await db.query.counselorAssignments.findMany({
    where: eq(counselorAssignments.counselorId, counselorId),
    with: {
      student: true,
      program: true,
      conversation: true,
    },
  });

  // Get open assignments (not assigned to any counselor)
  const openAssignments = await db.query.counselorAssignments.findMany({
    where: isNull(counselorAssignments.counselorId),
    with: {
      student: true,
      program: true,
      conversation: true,
    },
  });

  return {
    myAssignments,
    openAssignments,
  };
}

export default async function CounselorDashboardHomePage() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const { myAssignments, openAssignments } = await getCounselorAssignments(userId);

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Counselor Dashboard" 
        text="Manage your student assignments and view open requests"
      />
      <div className="mt-8">
        <AssignmentsTabs
          openAssignments={openAssignments}
          myAssignments={myAssignments}
        />
      </div>
    </DashboardShell>
  );
}
