// Global in-memory Room Store for multiplayer quiz sessions
export interface PlayerSession {
  id: string;
  name: string;
  avatar: {
    skin: number;
    gender: 'boy' | 'girl';
    costume: string;
    emoji: string;
  };
  score: number;
  streak: number;
  isAlive: boolean;
  joinedAt: number;
  solvedBoxes?: (string | number)[];
  solvedSteps?: Record<string, number[]>; // boxId -> array of completed steps [1, 2, 3]
}

export interface BoxStepProgress {
  boxId: string;
  facilityId: string;
  completedSteps: number[]; // e.g. [1, 2, 3]
  currentStep: number;      // 1, 2, 3, or 4 (4 = all 3 steps completed)
  isCompleted: boolean;
  solvedBy?: string;        // playerId
  solvedByName?: string;    // player name
  updatedAt: number;
}

export interface RoomProgressInfo {
  totalBoxes: number;
  completedBoxes: number;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  boxStates: Record<string, BoxStepProgress>;
}

export interface QuizRoom {
  roomId: string; // e.g. "7849-2104"
  pin: string;    // "78492104"
  hostName: string;
  quizId: string;
  textbook: string;
  chapterNumber: number;
  chapterTitle: string;
  targetCanDo: string;
  gameMode: 'OX_SURVIVAL' | 'PARTICLE_HUNTER' | 'CAN_DO_ESCAPE' | 'KOTOBA_RUNNER';
  mapTheme: string;
  isLocked: boolean;
  status: 'LOBBY' | 'COUNTDOWN' | 'QUESTION_ACTIVE' | 'QUESTION_LOCKED' | 'REVEAL' | 'LEADERBOARD' | 'PODIUM';
  currentQuestionIndex: number;
  timeRemaining: number;
  players: Record<string, PlayerSession>;
  createdAt: number;
  boxProgress?: Record<string, BoxStepProgress>;
  roomProgress?: RoomProgressInfo;
}

// Attach to globalThis so it persists across Next.js API route invocations in development
const globalStore = globalThis as unknown as { __rooms?: Map<string, QuizRoom> };
if (!globalStore.__rooms) {
  globalStore.__rooms = new Map<string, QuizRoom>();
}

export const roomsStore = globalStore.__rooms;

export function generateRoomPin(): { roomId: string; pin: string } {
  const p1 = Math.floor(1000 + Math.random() * 9000).toString();
  const p2 = Math.floor(1000 + Math.random() * 9000).toString();
  return {
    pin: `${p1}${p2}`,
    roomId: `${p1}-${p2}`
  };
}

/**
 * Computes aggregated room progress across all boxes in the facility.
 */
export function computeRoomProgress(
  boxProgress: Record<string, BoxStepProgress> | undefined,
  totalFacilityBoxes = 12
): RoomProgressInfo {
  const boxStates = boxProgress || {};
  const boxEntries = Object.values(boxStates);

  const totalBoxes = Math.max(totalFacilityBoxes, boxEntries.length);
  const totalSteps = totalBoxes * 3;

  let completedBoxes = 0;
  let completedSteps = 0;

  for (const item of boxEntries) {
    const stepsCount = item.completedSteps ? item.completedSteps.length : 0;
    completedSteps += stepsCount;
    if (item.isCompleted || stepsCount >= 3) {
      completedBoxes++;
    }
  }

  const percentComplete = totalSteps > 0
    ? Math.min(100, Math.round((completedSteps / totalSteps) * 100))
    : 0;

  return {
    totalBoxes,
    completedBoxes,
    totalSteps,
    completedSteps,
    percentComplete,
    boxStates
  };
}
