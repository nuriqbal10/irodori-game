import { NextRequest, NextResponse } from 'next/server';
import { generateBattleQuestions } from '@/lib/battle-engine';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const wave = parseInt(searchParams.get('wave') || '1', 10);
  const count = parseInt(searchParams.get('count') || '5', 10);

  // Progressive difficulty depending on wave:
  // Wave 1-3: A1 basics (kotoba & kanji)
  // Wave 4-7: A2.1 (all modes)
  // Wave 8+: Comprehensive A2.2 mixed
  let targetLevel = 'a1';
  if (wave >= 8) {
    targetLevel = 'a2-2';
  } else if (wave >= 4) {
    targetLevel = 'a2-1';
  } else {
    targetLevel = 'a1';
  }

  // Generate balanced hybrid questions
  const questions = generateBattleQuestions('all', targetLevel, count);

  return NextResponse.json({
    success: true,
    wave,
    targetLevel,
    count: questions.length,
    questions,
  });
}
