import { POST } from '../src/app/api/room/[roomId]/solve/route';
import { roomsStore, QuizRoom } from '../src/lib/room-store';

async function runTests() {
  console.log('='.repeat(75));
  console.log('  INTEGRATION TEST: /api/room/[roomId]/solve ROUTE HANDLER');
  console.log('='.repeat(75));

  const roomId = 'test-room-8888';
  const playerId = 'player_alpha_1';

  // Seed room
  const testRoom: QuizRoom = {
    roomId,
    pin: '88889999',
    hostName: 'Iqbal Sensei',
    quizId: 'chap_01',
    textbook: 'Irodori Starter',
    chapterNumber: 1,
    chapterTitle: 'Ruang Kelas',
    targetCanDo: 'Menyebutkan benda di kelas',
    gameMode: 'CAN_DO_ESCAPE',
    mapTheme: 'CLASSROOM_JP',
    isLocked: false,
    status: 'QUESTION_ACTIVE',
    currentQuestionIndex: 0,
    timeRemaining: 60,
    players: {
      [playerId]: {
        id: playerId,
        name: 'Budi Siswa',
        avatar: { skin: 1, gender: 'boy', costume: 'uniform_jp', emoji: '👨‍🎓' },
        score: 0,
        streak: 0,
        isAlive: true,
        joinedAt: Date.now(),
        solvedBoxes: [],
        solvedSteps: {}
      }
    },
    createdAt: Date.now()
  };

  roomsStore.set(roomId, testRoom);
  console.log(`✔ Created test room "${roomId}" with player "${playerId}".`);

  // --- TEST 1: Step 1 Correct (+100) ---
  console.log('\n--- 1. Testing Step 1 (Noun) Correct Answer ---');
  const req1 = new Request(`http://localhost:3000/api/room/${roomId}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      facilityId: 'fac_kyoushitsu',
      boxId: 'box_kyo_01',
      step: 1,
      answer: 'えんぴつ'
    })
  });

  const res1 = await POST(req1, { params: Promise.resolve({ roomId }) });
  const data1 = await res1.json();
  console.log('Response Step 1:', data1);

  if (data1.success !== true || data1.pointsEarned !== 100 || data1.nextStep !== 2) {
    throw new Error(`Step 1 assertion failed: ${JSON.stringify(data1)}`);
  }
  const updatedPlayer1 = roomsStore.get(roomId)?.players[playerId];
  if (updatedPlayer1?.score !== 100) {
    throw new Error(`Player score mismatch: expected 100, got ${updatedPlayer1?.score}`);
  }
  console.log('✔ Step 1 Passed: +100 points, nextStep: 2, player score: 100');

  // --- TEST 2: Step 2 Wrong Answer ---
  console.log('\n--- 2. Testing Step 2 (Verb) Incorrect Answer ---');
  const req2Fail = new Request(`http://localhost:3000/api/room/${roomId}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      facilityId: 'fac_kyoushitsu',
      boxId: 'box_kyo_01',
      step: 2,
      answer: 'かかないで' // wrong option
    })
  });

  const res2Fail = await POST(req2Fail, { params: Promise.resolve({ roomId }) });
  const data2Fail = await res2Fail.json();
  console.log('Response Step 2 Wrong Answer:', data2Fail);

  if (data2Fail.success !== false || data2Fail.pointsEarned !== 0) {
    throw new Error(`Step 2 fail assertion failed: ${JSON.stringify(data2Fail)}`);
  }
  console.log('✔ Step 2 Incorrect Handled Gracefully: success: false, pointsEarned: 0');

  // --- TEST 3: Step 2 Correct (+150) ---
  console.log('\n--- 3. Testing Step 2 (Verb) Correct Answer ---');
  const req2 = new Request(`http://localhost:3000/api/room/${roomId}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      facilityId: 'fac_kyoushitsu',
      boxId: 'box_kyo_01',
      step: 2,
      answer: 'かいて'
    })
  });

  const res2 = await POST(req2, { params: Promise.resolve({ roomId }) });
  const data2 = await res2.json();
  console.log('Response Step 2:', data2);

  if (data2.success !== true || data2.pointsEarned !== 150 || data2.nextStep !== 3) {
    throw new Error(`Step 2 assertion failed: ${JSON.stringify(data2)}`);
  }
  const updatedPlayer2 = roomsStore.get(roomId)?.players[playerId];
  if (updatedPlayer2?.score !== 250) {
    throw new Error(`Player score mismatch: expected 250, got ${updatedPlayer2?.score}`);
  }
  console.log('✔ Step 2 Passed: +150 points, nextStep: 3, player score: 250');

  // --- TEST 4: Step 3 Correct (+250) with Token Array ---
  console.log('\n--- 4. Testing Step 3 (Sentence) Correct Answer (Array of Tokens) ---');
  const req3 = new Request(`http://localhost:3000/api/room/${roomId}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      facilityId: 'fac_kyoushitsu',
      boxId: 'box_kyo_01',
      step: 3,
      answer: ['えんぴつ', 'で', 'なまえ', 'を', 'かいて ください']
    })
  });

  const res3 = await POST(req3, { params: Promise.resolve({ roomId }) });
  const data3 = await res3.json();
  console.log('Response Step 3:', data3);

  if (data3.success !== true || data3.pointsEarned !== 250 || data3.nextStep !== null || data3.isBoxCompleted !== true) {
    throw new Error(`Step 3 assertion failed: ${JSON.stringify(data3)}`);
  }
  const updatedPlayer3 = roomsStore.get(roomId)?.players[playerId];
  if (updatedPlayer3?.score !== 500) {
    throw new Error(`Player score mismatch: expected 500, got ${updatedPlayer3?.score}`);
  }
  console.log('✔ Step 3 Passed: +250 points, nextStep: null, isBoxCompleted: true, player score: 500');

  // --- TEST 5: Verify Room and Box Status in Room Store ---
  console.log('\n--- 5. Verifying Room & Box Progress in Memory Store ---');
  const finalRoom = roomsStore.get(roomId);
  const boxState = finalRoom?.boxProgress?.['box_kyo_01'];
  console.log('Box State in Room:', boxState);
  console.log('Room Progress in Room:', finalRoom?.roomProgress);

  if (!boxState?.isCompleted || boxState.currentStep !== 4 || boxState.completedSteps.length !== 3) {
    throw new Error(`Box state incomplete: ${JSON.stringify(boxState)}`);
  }
  if (!finalRoom?.roomProgress || finalRoom.roomProgress.completedBoxes !== 1) {
    throw new Error(`Room progress completedBoxes mismatch: ${JSON.stringify(finalRoom?.roomProgress)}`);
  }
  console.log('✔ Box State & Room Progress Verified: Box is fully completed (3/3 steps), room has 1 completed box.');

  // --- TEST 6: Testing Shokudou Pack Box with String Sentence ---
  console.log('\n--- 6. Testing Shokudou Pack Box (box_sho_01) ---');
  const reqSho = new Request(`http://localhost:3000/api/room/${roomId}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      facilityId: 'fac_shokudou',
      boxId: 'box_sho_01',
      step: 1,
      answer: 'はし'
    })
  });

  const resSho = await POST(reqSho, { params: Promise.resolve({ roomId }) });
  const dataSho = await resSho.json();
  console.log('Response Shokudou Step 1:', dataSho);

  if (dataSho.success !== true || dataSho.pointsEarned !== 100) {
    throw new Error(`Shokudou Step 1 assertion failed: ${JSON.stringify(dataSho)}`);
  }
  console.log('✔ Shokudou Pack Box successfully solved for Step 1 (+100 points).');

  console.log('\n' + '='.repeat(75));
  console.log('  🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('='.repeat(75));
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
