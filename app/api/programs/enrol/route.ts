import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { studentProfiles, programs, chatSessions, programEnrollmentRequests } from "@/lib/db/schema";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  


}