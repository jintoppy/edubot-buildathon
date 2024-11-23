import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { counselorAssignments } from "@/lib/db/schema";
import { checkAuth } from "@/lib/checkAuth";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const assignments = await db
      .select({
        id: counselorAssignments.id,
        createdAt: counselorAssignments.createdAt,
        status: counselorAssignments.status,
        user: {
          fullName: users.fullName,
          email: users.email,
        },
        program: {
          name: programs.name,
          level: programs.level,
        },
        chatSession: {
          summary: chatSessions.summary,
          startTime: chatSessions.startTime,
        },
      })
      .from(counselorAssignments)
      .leftJoin(users, eq(counselorAssignments.studentId, users.id))
      .leftJoin(programs, eq(counselorAssignments.programId, programs.id))
      .leftJoin(chatSessions, eq(counselorAssignments.conversationId, chatSessions.id))
      .where(eq(counselorAssignments.counselorId, authResult.user.id));

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching counselor assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch counselor assignments" },
      { status: 500 }
    );
  }
}
