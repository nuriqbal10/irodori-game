import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { survivalRecords, users, avatarProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { mode, waveReached, score, accuracyPercent, correctCount, wrongCount, teammates } = body;

    let dbUserId = 'guest';

    if (userId) {
      const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
      if (dbUsers.length > 0) {
        dbUserId = dbUsers[0].id;

        // Record survival session
        await db.insert(survivalRecords).values({
          id: `surv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: dbUserId,
          mode: mode || 'solo',
          waveReached: waveReached || 1,
          score: score || 0,
          accuracyPercent: accuracyPercent || 0,
          correctCount: correctCount || 0,
          wrongCount: wrongCount || 0,
          teammates: teammates || [],
        });

        // Reward player with Yen Coins & EXP
        const userAvatars = await db.select().from(avatarProfiles).where(eq(avatarProfiles.userId, dbUserId)).limit(1);
        if (userAvatars.length > 0) {
          const current = userAvatars[0];
          const coinsEarned = Math.floor(score / 10);
          const expEarned = Math.floor(score / 5);

          await db
            .update(avatarProfiles)
            .set({
              yenCoins: (current.yenCoins || 0) + coinsEarned,
              exp: (current.exp || 0) + expEarned,
              updatedAt: new Date(),
            })
            .where(eq(avatarProfiles.id, current.id));
        }
      }
    }

    // Fetch top 10 leaderboard records
    const topLeaderboard = await db
      .select({
        id: survivalRecords.id,
        mode: survivalRecords.mode,
        waveReached: survivalRecords.waveReached,
        score: survivalRecords.score,
        accuracyPercent: survivalRecords.accuracyPercent,
        playedAt: survivalRecords.playedAt,
        userName: users.name,
      })
      .from(survivalRecords)
      .leftJoin(users, eq(survivalRecords.userId, users.id))
      .orderBy(desc(survivalRecords.score))
      .limit(10);

    return NextResponse.json({
      success: true,
      leaderboard: topLeaderboard,
    });
  } catch (error) {
    console.error('Error saving survival finish:', error);
    return NextResponse.json({ success: false, error: 'Database record failed' }, { status: 500 });
  }
}
