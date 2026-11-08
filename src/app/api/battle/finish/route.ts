import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { battleMatchHistory, avatarProfiles } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { mode, level, isWinner, score, accuracy, coinsEarned, expEarned } = body;

    const matchId = `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Record match history in Neon DB
    await db.insert(battleMatchHistory).values({
      id: matchId,
      roomCode: body.roomCode || 'SOLO_AI',
      mode: mode || 'kotoba',
      topicLevel: level || 'all',
      topicChapter: 0,
      topicCategory: mode || 'arena',
      winnerEmail: isWinner ? (userId || 'player') : 'AI_Sensei',
      winnerScore: score || 0,
      participantCount: 2,
      participantsData: [
        { id: userId || 'player', score: score || 0, isWinner: !!isWinner },
        { id: 'AI_Sensei', score: Math.max(0, (score || 100) - 20), isWinner: !isWinner },
      ],
      playedAt: Date.now(),
    });

    // 2. Award Yen coins and EXP if logged in
    if (userId) {
      await db.update(avatarProfiles)
        .set({
          yenCoins: sql`${avatarProfiles.yenCoins} + ${coinsEarned || 50}`,
          exp: sql`${avatarProfiles.exp} + ${expEarned || 100}`,
          updatedAt: new Date(),
        })
        .where(eq(avatarProfiles.userId, userId));
    }

    return NextResponse.json({
      success: true,
      matchId,
      coinsEarned: coinsEarned || 50,
      expEarned: expEarned || 100,
    });
  } catch (error: any) {
    console.error('Failed to record battle finish:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
