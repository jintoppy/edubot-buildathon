import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isNull } from "drizzle-orm";
import { counselorAssignments } from "@/lib/db/schema";
import { checkAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const assignments = await db.query.counselorAssignments.findMany({
      where: isNull(counselorAssignments.counselorId),
      with: {
        student: true,
        program: true,
        conversation: true,
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
