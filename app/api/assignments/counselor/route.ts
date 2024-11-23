import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { counselorAssignments } from "@/lib/db/schema";
import { checkAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  try {
    const assignments = await db.query.counselorAssignments.findMany({
      where: eq(counselorAssignments.counselorId, authResult.user.id),
      with: {
        student: true,
        program: true,
        conversation: true,
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
