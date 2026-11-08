import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { canDoProgress, users, avatarProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { level, lessonNum, stars, score, canDoTitle } = body;

    if (!userId) {
      // Guest completed stage
      return NextResponse.json({
        success: true,
        isGuest: true,
        message: 'Progress recorded locally for guest session.',
      });
    }

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    const dbUser = dbUsers[0];

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 1. Update or Insert completed stage
    const existing = await db
      .select()
      .from(canDoProgress)
      .where(
        and(
          eq(canDoProgress.userId, dbUser.id),
          eq(canDoProgress.level, level),
          eq(canDoProgress.lessonNum, lessonNum)
        )
      )
      .limit(1);

    const stageId = `${dbUser.id}-${level}-${lessonNum}`;

    if (existing.length > 0) {
      const prevStars = existing[0].stars || 0;
      await db
        .update(canDoProgress)
        .set({
          stars: Math.max(prevStars, stars),
          score: Math.max(existing[0].score || 0, score || 100),
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(canDoProgress.id, existing[0].id));
    } else {
      await db.insert(canDoProgress).values({
        id: stageId,
        userId: dbUser.id,
        level,
        lessonNum,
        canDoTitle: canDoTitle || `Bab ${lessonNum}`,
        stars: Math.max(1, stars || 1),
        score: score || 100,
        isUnlocked: true,
        isCompleted: true,
        completedAt: new Date(),
      });
    }

    // 2. Unlock Next Stage if lessonNum < 18
    if (lessonNum < 18) {
      const nextLesson = lessonNum + 1;
      const nextStageId = `${dbUser.id}-${level}-${nextLesson}`;
      const nextExisting = await db
        .select()
        .from(canDoProgress)
        .where(
          and(
            eq(canDoProgress.userId, dbUser.id),
            eq(canDoProgress.level, level),
            eq(canDoProgress.lessonNum, nextLesson)
          )
        )
        .limit(1);

      if (nextExisting.length === 0) {
        await db.insert(canDoProgress).values({
          id: nextStageId,
          userId: dbUser.id,
          level,
          lessonNum: nextLesson,
          canDoTitle: `Bab ${nextLesson}`,
          stars: 0,
          score: 0,
          isUnlocked: true,
          isCompleted: false,
        });
      }
    }

    // 3. Reward Player with Yen Coins & EXP
    const userAvatars = await db.select().from(avatarProfiles).where(eq(avatarProfiles.userId, dbUser.id)).limit(1);
    if (userAvatars.length > 0) {
      const current = userAvatars[0];
      const newCoins = (current.yenCoins || 0) + 150;
      const newExp = (current.exp || 0) + 200;
      const newLevel = Math.floor(newExp / 500) + 1;

      await db
        .update(avatarProfiles)
        .set({
          yenCoins: newCoins,
          exp: newExp,
          levelRank: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(avatarProfiles.id, current.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Stage progress and rewards saved successfully!',
    });
  } catch (error) {
    console.error('Error saving stage completion:', error);
    return NextResponse.json({ success: false, error: 'Database save failed' }, { status: 500 });
  }
}
