import { NextResponse } from 'next/server';
import { roomsStore, computeRoomProgress, RoomProgressInfo, BoxStepProgress } from '@/lib/room-store';
import { 
  getFacilityBox, 
  validateStepAnswer, 
  StepNumber, 
  STEP_POINTS 
} from '@/lib/curriculum-loader';

export const dynamic = 'force-dynamic';

interface SolveRequestBody {
  playerId: string;
  facilityId: string;
  boxId: string;
  step: StepNumber;
  answer: string | string[];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = (await req.json()) as Partial<SolveRequestBody>;
    const { playerId, facilityId, boxId, step, answer } = body;

    // 1. Validate required request payload
    if (!playerId || !facilityId || !boxId || step === undefined || answer === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter tidak lengkap: playerId, facilityId, boxId, step, dan answer wajib diisi.',
        },
        { status: 400 }
      );
    }

    const stepNum = Number(step) as StepNumber;
    if (![1, 2, 3].includes(stepNum)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter step harus bernilai 1, 2, atau 3.',
        },
        { status: 400 }
      );
    }

    // 2. Resolve box and curriculum data
    const resolved = getFacilityBox(facilityId, boxId);
    if (!resolved || !resolved.box) {
      return NextResponse.json(
        {
          success: false,
          error: `Box "${boxId}" tidak ditemukan pada facility "${facilityId}".`,
        },
        { status: 404 }
      );
    }

    const { facility, box } = resolved;

    // 3. Validate pedagogical answer
    const validation = validateStepAnswer(box, stepNum, answer);

    const room = roomsStore.get(roomId);

    // If answer is incorrect
    if (!validation.isValid) {
      const roomProgress: RoomProgressInfo = room
        ? computeRoomProgress(room.boxProgress, facility.totalBoxes)
        : computeRoomProgress(undefined, facility.totalBoxes);

      return NextResponse.json({
        success: false,
        pointsEarned: 0,
        nextStep: stepNum,
        roomProgress,
        message: validation.feedback || 'Jawaban belum tepat, silakan coba lagi.',
        explanation: validation.explanation,
        boxId,
        step: stepNum,
        isBoxCompleted: false,
      });
    }

    // 4. Answer is correct! Calculate progression & points
    const pointsEarned = STEP_POINTS[stepNum];
    const nextStep = stepNum < 3 ? ((stepNum + 1) as StepNumber) : null;
    const isBoxCompleted = stepNum === 3;

    let roomProgress: RoomProgressInfo;

    if (room) {
      // Find or create player session
      let player = room.players[playerId];
      if (!player) {
        player = {
          id: playerId,
          name: `Siswa_${playerId.substring(0, 6)}`,
          avatar: {
            skin: 1,
            gender: 'boy',
            costume: 'uniform_jp',
            emoji: '👨‍🎓',
          },
          score: 0,
          streak: 0,
          isAlive: true,
          joinedAt: Date.now(),
          solvedBoxes: [],
          solvedSteps: {},
        };
        room.players[playerId] = player;
      }

      // Initialize room box tracking
      if (!room.boxProgress) {
        room.boxProgress = {};
      }

      let boxState: BoxStepProgress = room.boxProgress[boxId];
      if (!boxState) {
        boxState = {
          boxId,
          facilityId: facility.facilityId,
          completedSteps: [],
          currentStep: 1,
          isCompleted: false,
          solvedBy: playerId,
          solvedByName: player.name,
          updatedAt: Date.now(),
        };
        room.boxProgress[boxId] = boxState;
      }

      // Check whether this step was already solved previously for this box
      const isFirstSolveForBox = !boxState.completedSteps.includes(stepNum);
      if (isFirstSolveForBox) {
        boxState.completedSteps.push(stepNum);
        boxState.completedSteps.sort((a, b) => a - b);
      }

      boxState.solvedBy = playerId;
      boxState.solvedByName = player.name;
      boxState.updatedAt = Date.now();

      if (isBoxCompleted || boxState.completedSteps.length >= 3) {
        boxState.isCompleted = true;
        boxState.currentStep = 4; // 4 signifies all steps finished
      } else {
        boxState.currentStep = Math.max(boxState.currentStep, stepNum + 1);
      }

      // Update player score, streak, and step tracking
      player.score = (player.score || 0) + pointsEarned;
      player.streak = (player.streak || 0) + 1;

      if (!player.solvedSteps) {
        player.solvedSteps = {};
      }
      if (!player.solvedSteps[boxId]) {
        player.solvedSteps[boxId] = [];
      }
      if (!player.solvedSteps[boxId].includes(stepNum)) {
        player.solvedSteps[boxId].push(stepNum);
      }

      if (!player.solvedBoxes) {
        player.solvedBoxes = [];
      }
      if (isBoxCompleted && !player.solvedBoxes.includes(boxId)) {
        player.solvedBoxes.push(boxId);
      }

      // Recalculate full room progress
      roomProgress = computeRoomProgress(room.boxProgress, facility.totalBoxes);
      room.roomProgress = roomProgress;

      roomsStore.set(roomId, room);
    } else {
      // Room not found in memory (e.g. standalone test, demo mode, or disconnected session)
      const mockBoxState: BoxStepProgress = {
        boxId,
        facilityId: facility.facilityId,
        completedSteps: [stepNum],
        currentStep: isBoxCompleted ? 4 : stepNum + 1,
        isCompleted: isBoxCompleted,
        solvedBy: playerId,
        updatedAt: Date.now(),
      };

      const mockBoxProgress: Record<string, BoxStepProgress> = {
        [boxId]: mockBoxState,
      };

      roomProgress = computeRoomProgress(mockBoxProgress, facility.totalBoxes);
    }

    return NextResponse.json({
      success: true,
      pointsEarned,
      nextStep,
      roomProgress,
      message: validation.feedback,
      explanation: validation.explanation,
      boxId,
      step: stepNum,
      isBoxCompleted,
    });
  } catch (error) {
    console.error('Error handling /api/room/[roomId]/solve:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server saat memproses jawaban.' },
      { status: 500 }
    );
  }
}
