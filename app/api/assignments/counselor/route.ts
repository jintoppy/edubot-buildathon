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
    const assignments = await db.query.counselorAssignments.findMany({
      where: eq(counselorAssignments.counselorId, authResult.user.id),
      with: {
        users: {
          columns: {
            id: true,
            fullName: true,
            email: true
          }
        },
        programs: {
          columns: {
            id: true,
            name: true,
            level: true
          }
        },
        chatSessions: {
          columns: {
            id: true,
            summary: true,
            startTime: true
          }
        }
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching counselor assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch counselor assignments" },
      { status: 500 }
    );
  }
}
