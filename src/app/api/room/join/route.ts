import { NextResponse } from 'next/server';
import { roomsStore, PlayerSession } from '@/lib/room-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, name, avatar } = body;

    if (!pin || !name) {
      return NextResponse.json({ success: false, error: 'PIN dan Nama wajib diisi' }, { status: 400 });
    }

    const cleanPin = pin.toString().replace(/[-\s]/g, '');

    // Find room by PIN
    const targetRoom = Array.from(roomsStore.values()).find(r => r.pin === cleanPin);

    if (!targetRoom) {
      return NextResponse.json({ success: false, error: 'Kode PIN Room tidak ditemukan!' }, { status: 404 });
    }

    if (targetRoom.isLocked) {
      return NextResponse.json({ success: false, error: 'Pintu masuk room ini telah dikunci oleh Sensei' }, { status: 403 });
    }

    const playerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newPlayer: PlayerSession = {
      id: playerId,
      name: name.trim().substring(0, 15),
      avatar: avatar || {
        skin: 1,
        gender: 'boy',
        costume: 'uniform_jp',
        emoji: '👨‍🎓'
      },
      score: 0,
      streak: 0,
      isAlive: true,
      joinedAt: Date.now()
    };

    targetRoom.players[playerId] = newPlayer;
    roomsStore.set(targetRoom.roomId, targetRoom);

    return NextResponse.json({
      success: true,
      playerId,
      room: {
        roomId: targetRoom.roomId,
        pin: targetRoom.pin,
        chapterTitle: targetRoom.chapterTitle,
        gameMode: targetRoom.gameMode,
        status: targetRoom.status
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ success: false, error: 'Gagal masuk ke room' }, { status: 500 });
  }
}
