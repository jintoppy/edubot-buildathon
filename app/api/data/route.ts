import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { documentation } from "@/lib/db/schema";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const results = await db.select().from(documentation);

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const data = await req.json();
  const doc = await db.insert(documentation).values(data);
  return NextResponse.json(doc);
}

export async function PUT(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const { id, ...data } = await req.json();
  await db.update(documentation).set(data).where(eq(documentation.id, id));

  return NextResponse.json({ success: true });
}
