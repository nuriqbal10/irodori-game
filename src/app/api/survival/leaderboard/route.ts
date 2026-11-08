import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { survivalRecords, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const topRecords = await db
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
      leaderboard: topRecords,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({
      success: true,
      leaderboard: [],
    });
  }
}
