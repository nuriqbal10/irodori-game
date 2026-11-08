import { NextRequest, NextResponse } from 'next/server';
import { getStageData } from '@/lib/adventure-engine';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const level = (searchParams.get('level') || 'a1') as 'a1' | 'a2-1' | 'a2-2';
  const lesson = parseInt(searchParams.get('lesson') || '1', 10);

  const stage = getStageData(level, lesson);

  return NextResponse.json({
    success: true,
    stage,
  });
}
