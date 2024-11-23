import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isNull } from "drizzle-orm";
import { counselorAssignments } from "@/lib/db/schema";
import { checkAuth } from "@/lib/checkAuth";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  console.log('authResult', authResult)

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    console.log('status', status)

    const assignments = await db.query.counselorAssignments.findMany({
      where: isNull(counselorAssignments.counselorId),
      with: {
        users: true,
        programs: true,
        chatSessions: true,
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
