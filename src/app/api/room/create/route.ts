import { NextResponse } from 'next/server';
import { roomsStore, generateRoomPin, QuizRoom } from '@/lib/room-store';
import { LPK_CHAPTERS } from '@/data/lpk-curriculum-catalog';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chapterId, gameMode = 'OX_SURVIVAL', hostName = 'Iqbal Sensei' } = body;

    const chapter = LPK_CHAPTERS.find(c => c.id === chapterId) || LPK_CHAPTERS[0];
    const { pin, roomId } = generateRoomPin();

    const newRoom: QuizRoom = {
      roomId,
      pin,
      hostName,
      quizId: chapter.id,
      textbook: chapter.textbookName,
      chapterNumber: chapter.chapterNumber,
      chapterTitle: `${chapter.titleJapanese} (${chapter.titleIndonesian})`,
      targetCanDo: chapter.targetCanDo,
      gameMode,
      mapTheme: chapter.mapTheme,
      isLocked: false,
      status: 'LOBBY',
      currentQuestionIndex: 0,
      timeRemaining: 20,
      players: {},
      createdAt: Date.now()
    };

    roomsStore.set(roomId, newRoom);

    return NextResponse.json({
      success: true,
      room: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
  }
}
