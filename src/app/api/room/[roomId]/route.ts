import { NextResponse } from 'next/server';
import { roomsStore } from '@/lib/room-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = roomsStore.get(roomId);

  if (!room) {
    return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    room: {
      ...room,
      playersCount: Object.keys(room.players).length
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = roomsStore.get(roomId);

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, playerId } = body;

    switch (action) {
      case 'LOCK':
        room.isLocked = true;
        break;
      case 'UNLOCK':
        room.isLocked = false;
        break;
      case 'START_GAME':
        room.status = 'COUNTDOWN';
        break;
      case 'KICK_PLAYER':
        if (playerId && room.players[playerId]) {
          delete room.players[playerId];
        }
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    roomsStore.set(roomId, room);

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to update room' }, { status: 500 });
  }
}
