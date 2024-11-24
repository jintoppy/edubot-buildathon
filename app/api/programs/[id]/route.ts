import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documentation, users, programs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }
  const programId = (await params).id;
}