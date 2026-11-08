import { NextRequest, NextResponse } from 'next/server';
import { generateBattleQuestions, BattleMode } from '@/lib/battle-engine';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = (searchParams.get('mode') || 'kotoba') as BattleMode;
  const level = searchParams.get('level') || 'all';
  const count = parseInt(searchParams.get('count') || '5', 10);

  const questions = generateBattleQuestions(mode, level, count);

  return NextResponse.json({
    success: true,
    mode,
    level,
    count: questions.length,
    questions,
  });
}
