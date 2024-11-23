import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, counselorProfiles } from '@/lib/db/schema';

export async function POST(req: Request) {
  try {
    const { clerkId, email, specializations, biography, fullName } = await req.json();

    // Create user and profile in a transaction
    await db.transaction(async (tx) => {
      // Create user record
      const [user] = await tx
        .insert(users)
        .values({
          clerkId,
          email,
          fullName,
          role: 'counselor',
        })
        .returning();

      // Create counselor profile
      await tx
        .insert(counselorProfiles)
        .values({
          userId: user.id,
          specializations,
          biography,
          availability: {}, // Default empty availability
        });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create counselor profile:', error);
    return NextResponse.json(
      { error: 'Failed to create counselor profile' },
      { status: 500 }
    );
  }
}