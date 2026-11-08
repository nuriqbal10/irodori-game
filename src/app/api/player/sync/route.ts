import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, avatarProfiles, canDoProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@example.com`;
    const name = clerkUser.fullName || clerkUser.username || clerkUser.firstName || 'Pemain Irodori';

    // 1. Check or insert into users table
    const existingUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    let dbUser = existingUser[0];

    if (!dbUser) {
      const inserted = await db.insert(users).values({
        id: userId,
        clerkId: userId,
        email,
        name,
        role: 'student',
      }).returning();
      dbUser = inserted[0];
    }

    // 2. Check or insert avatar profile
    const existingAvatar = await db.select().from(avatarProfiles).where(eq(avatarProfiles.userId, dbUser.id)).limit(1);
    let avatar = existingAvatar[0];

    if (!avatar) {
      const newAvatar = await db.insert(avatarProfiles).values({
        id: `avatar-${userId}`,
        userId: dbUser.id,
        displayName: name,
        equippedTitle: 'Siswa Pemula (初心者)',
        yenCoins: 1000, // 1000 Yen welcome bonus!
        exp: 0,
        levelRank: 1,
      }).returning();
      avatar = newAvatar[0];

      // Initialize Can-Do Chapter 1 unlock for A1
      await db.insert(canDoProgress).values({
        id: `cando-${userId}-a1-1`,
        userId: dbUser.id,
        level: 'a1',
        lessonNum: 1,
        canDoTitle: 'Bab 1: Salam & Perkenalan Diri',
        stars: 0,
        score: 0,
        isUnlocked: true,
        isCompleted: false,
      });
    }

    return NextResponse.json({
      success: true,
      user: dbUser,
      avatar,
    });
  } catch (error: any) {
    console.error('Player sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
