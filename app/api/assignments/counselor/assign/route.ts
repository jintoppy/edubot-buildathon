import { checkAuth } from "@/lib/checkAuth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return NextResponse.json(authResult, { status: 401 });
    }

    
    
}  