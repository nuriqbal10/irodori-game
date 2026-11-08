import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { canDoProgress, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = req.nextUrl.searchParams;
    const level = (searchParams.get('level') || 'a1') as 'a1' | 'a2-1' | 'a2-2';

    if (!userId) {
      // Guest player default progress: Stage 1 is unlocked
      return NextResponse.json({
        success: true,
        isGuest: true,
        progress: [
          { level, lessonNum: 1, stars: 0, isUnlocked: true, isCompleted: false },
        ],
      });
    }

    // Get DB user
    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    const dbUser = dbUsers[0];

    if (!dbUser) {
      return NextResponse.json({
        success: true,
        isGuest: false,
        progress: [
          { level, lessonNum: 1, stars: 0, isUnlocked: true, isCompleted: false },
        ],
      });
    }

    const records = await db
      .select()
      .from(canDoProgress)
      .where(and(eq(canDoProgress.userId, dbUser.id), eq(canDoProgress.level, level)));

    // Ensure Stage 1 is always unlocked if no records exist yet
    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        isGuest: false,
        progress: [
          { level, lessonNum: 1, stars: 0, isUnlocked: true, isCompleted: false },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      isGuest: false,
      progress: records,
    });
  } catch (error) {
    console.error('Error in adventure progress:', error);
    return NextResponse.json({
      success: true,
      isGuest: true,
      progress: [{ level: 'a1', lessonNum: 1, stars: 0, isUnlocked: true, isCompleted: false }],
    });
  }
}
