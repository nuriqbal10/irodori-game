'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { 
  Box, 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Palette, 
  Compass, 
  MapPin, 
  Info,
  Coins,
  Eye,
  Check
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface HotspotItem {
  id: string;
  kanji: string;
  reading: string;
  meaningId: string;
  position: [number, number, number]; // 3D coordinates on sphere
  audioHint?: string;
  quizPrompt: string;
  quizOptions: string[];
}

const ROOM_ENVIRONMENTS: Record<string, {
  name: string;
  nameJa: string;
  description: string;
  floorColor: string;
  wallColor: string;
  ceilingColor: string;
  hotspots: HotspotItem[];
}> = {
  classroom: {
    name: 'Ruang Kelas',
    nameJa: '教室 (きょうしつ)',
    description: 'Amati benda-benda di sekitar ruang belajar di Jepang.',
    floorColor: '#a67c52',
    wallColor: '#e8e4d9',
    ceilingColor: '#ffffff',
    hotspots: [
      {
        id: 'c1',
        kanji: '黒板',
        reading: 'こくばん',
        meaningId: 'Papan Tulis Hitam',
        position: [0, 10, -180],
        quizPrompt: 'Benda apa yang digunakan guru untuk menulis di depan kelas?',
        quizOptions: ['黒板 (こくばん)', '机 (つくえ)', '窓 (まど)', '本 (ほん)'],
      },
      {
        id: 'c2',
        kanji: '机',
        reading: 'つくえ',
        meaningId: 'Meja Belajar',
        position: [-60, -60, -140],
        quizPrompt: 'Benda tempat siswa menaruh buku dan menulis?',
        quizOptions: ['椅子 (いす)', '机 (つくえ)', '鉛筆 (えんぴつ)', '黒板 (こくばん)'],
      },
      {
        id: 'c3',
        kanji: '椅子',
        reading: 'いす',
        meaningId: 'Kursi',
        position: [-60, -90, -120],
        quizPrompt: 'Tempat duduk siswa di dalam kelas?',
        quizOptions: ['時計 (とけい)', 'ドア (どあ)', '椅子 (いす)', '鞄 (かばん)'],
      },
      {
        id: 'c4',
        kanji: '時計',
        reading: 'とけい',
        meaningId: 'Jam Dinding',
        position: [120, 80, -100],
        quizPrompt: 'Alat penunjuk waktu pelajaran di dinding?',
        quizOptions: ['時計 (とけい)', 'カレンダー', '写真 (しゃしん)', 'テレビ'],
      },
      {
        id: 'c5',
        kanji: '窓',
        reading: 'まど',
        meaningId: 'Jendela',
        position: [180, 20, 0],
        quizPrompt: 'Bagian dinding kaca tempat cahaya dan udara masuk?',
        quizOptions: ['ドア', '窓 (まど)', '天井 (てんじょう)', '床 (ゆか)'],
      },
    ],
  },
  konbini: {
    name: 'Minimarket (Konbini)',
    nameJa: 'コンビニ',
    description: 'Kepekaan lingkungan berbelanja praktis di Jepang.',
    floorColor: '#d6d3ce',
    wallColor: '#f7f6f2',
    ceilingColor: '#ffffff',
    hotspots: [
      {
        id: 'k1',
        kanji: 'レジ',
        reading: 'れじ',
        meaningId: 'Mesin Kasir / Meja Pembayaran',
        position: [-100, -20, -140],
        quizPrompt: 'Tempat melakukan pembayaran dan mengambil kantong belanja?',
        quizOptions: ['レジ', 'お弁当 (おべんとう)', 'ATM', '傘 (かさ)'],
      },
      {
        id: 'k2',
        kanji: 'おにぎり',
        reading: 'おにぎり',
        meaningId: 'Nasi Kepal Rumput Laut',
        position: [0, -30, -180],
        quizPrompt: 'Makanan kepal beras Jepang populer berbungkus nori?',
        quizOptions: ['サンドイッチ', 'おにぎり', 'パン', 'カップめん'],
      },
      {
        id: 'k3',
        kanji: '冷たい飲み物',
        reading: 'つめたいのみもの',
        meaningId: 'Minuman Dingin di Kulkas',
        position: [150, 0, -80],
        quizPrompt: 'Kategori produk teh hijau dingin, susu, dan air mineral?',
        quizOptions: ['冷たい飲み物', '温かいスープ', '雑誌 (ざっし)', 'お菓子 (おかし)'],
      },
      {
        id: 'k4',
        kanji: '買い物かご',
        reading: 'かいものかご',
        meaningId: 'Keranjang Belanja',
        position: [-160, -70, -40],
        quizPrompt: 'Wadah plastik untuk membawa barang pilihan sebelum ke kasir?',
        quizOptions: ['財布 (さいふ)', '買い物かご', '袋 (ふくろ)', 'カード'],
      },
    ],
  },
  station: {
    name: 'Stasiun Kereta Api',
    nameJa: '駅 (えき)',
    description: 'Kenali fasilitas penting saat naik kereta di Jepang.',
    floorColor: '#78716c',
    wallColor: '#e7e5e4',
    ceilingColor: '#d6d3d1',
    hotspots: [
      {
        id: 's1',
        kanji: '改札口',
        reading: 'かいさつぐち',
        meaningId: 'Gerbang Tiket Otomatis',
        position: [0, -20, -180],
        quizPrompt: 'Pintu gerbang untuk tap kartu IC atau memasukkan tiket?',
        quizOptions: ['改札口 (かいさつぐち)', '非常口 (ひじょうぐち)', '窓口 (まどぐち)', '売店 (ばいてん)'],
      },
      {
        id: 's2',
        kanji: '時刻表',
        reading: 'じこくひょう',
        meaningId: 'Papan Jadwal Kereta',
        position: [130, 60, -110],
        quizPrompt: 'Tabel yang menampilkan jam kedatangan dan keberangkatan kereta?',
        quizOptions: ['地図 (ちず)', '時刻表 (じこくひょう)', '切符 (きっぷ)', '運賃表 (うんちんひょう)'],
      },
      {
        id: 's3',
        kanji: '券売機',
        reading: 'けんばいき',
        meaningId: 'Mesin Penjual Tiket Otomatis',
        position: [-150, 0, -80],
        quizPrompt: 'Mesin layar sentuh untuk membeli tiket dan top-up kartu IC?',
        quizOptions: ['自動販売機 (じどうはんばいき)', '券売機 (けんばいき)', '精算機 (せいさんき)', 'ロッカー'],
      },
      {
        id: 's4',
        kanji: 'ホーム',
        reading: 'ほーむ',
        meaningId: 'Peron Kereta',
        position: [0, -30, 180],
        quizPrompt: 'Area tempat penumpang berdiri menunggu kereta tiba?',
        quizOptions: ['ホーム', '階段 (かいだん)', 'エスカレーター', '出口 (でぐち)'],
      },
    ],
  },
};

export default function VoxelExplorerPage() {
  const { user } = useUser();

  // Environment State
  const [selectedEnvKey, setSelectedEnvKey] = useState<string>('classroom');
  const currentEnv = ROOM_ENVIRONMENTS[selectedEnvKey];

  // Hotspot Clicked State
  const [activeHotspot, setActiveHotspot] = useState<HotspotItem | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Voxel Avatar Customization State (Roblox / Minecraft Blocky)
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [avatarSettings, setAvatarSettings] = useState({
    skinColor: '#f4c29f',
    hairColor: '#2b221b',
    shirtColor: '#8f2222', // Red Kimono
    pantsColor: '#1e1b18', // Black Hakama
    accessory: 'hachimaki', // 'hachimaki' | 'glasses' | 'none'
  });

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([]);
  const voxelGroupRef = useRef<THREE.Group | null>(null);

  // Pointer dragging state for 360 look around
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lonRef = useRef<number>(90);
  const latRef = useRef<number>(0);

  // Load Saved Avatar from Neon DB
  useEffect(() => {
    fetch('/api/avatar/customization')
      .then(res => res.json())
      .then(data => {
        if (data?.avatar) {
          setAvatarSettings({
            skinColor: data.avatar.skinColor || '#f4c29f',
            hairColor: data.avatar.hairColor || '#2b221b',
            shirtColor: data.avatar.shirtColor || '#8f2222',
            pantsColor: data.avatar.pantsColor || '#1e1b18',
            accessory: data.avatar.accessory || 'hachimaki',
          });
        }
      })
      .catch(err => console.error('Error fetching avatar:', err));
  }, []);

  // Save Avatar Customization
  const handleSaveAvatar = async () => {
    try {
      await fetch('/api/avatar/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avatarSettings),
      });
      confetti({ particleCount: 50, spread: 50 });
      setShowCustomizer(false);
    } catch (e) {
      console.error('Failed to save avatar:', e);
    }
  };

  // Build Procedural 360 Panoramic Texture Canvas
  const createPanoramicTexture = (envKey: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const env = ROOM_ENVIRONMENTS[envKey];

    // Ceiling
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, 300);
    ceilGrad.addColorStop(0, '#1a1824');
    ceilGrad.addColorStop(1, env.ceilingColor);
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, 2048, 300);

    // Walls
    ctx.fillStyle = env.wallColor;
    ctx.fillRect(0, 300, 2048, 424);

    // Grid panels / Tatami lines on walls
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 4;
    for (let x = 0; x < 2048; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 300);
      ctx.lineTo(x, 724);
      ctx.stroke();
    }

    // Classroom / Konbini / Station specific drawings
    if (envKey === 'classroom') {
      // Chalkboard in center
      ctx.fillStyle = '#1e3a2b';
      ctx.fillRect(800, 360, 448, 220);
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 10;
      ctx.strokeRect(800, 360, 448, 220);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('日本語の授業 (Kelas Bahasa Jepang)', 840, 430);
      ctx.font = '22px sans-serif';
      ctx.fillText('Can-Do: 周りの物を観察しよう！', 840, 480);
      ctx.fillText('日付: 4月10日 (水)', 840, 530);
    } else if (envKey === 'konbini') {
      // Shelves and banners
      ctx.fillStyle = '#e63946';
      ctx.fillRect(0, 300, 2048, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('いらっしゃいませ！ 24時間営業 CONVENIENCE STORE', 700, 328);

      // Shelves
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(400, 400, 500, 240);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 4;
      ctx.strokeRect(400, 400, 500, 240);
    } else {
      // Station signboard
      ctx.fillStyle = '#2a9d8f';
      ctx.fillRect(700, 340, 648, 90);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('東京駅 (Tokyo Station)', 840, 395);
    }

    // Floor
    const floorGrad = ctx.createLinearGradient(0, 724, 0, 1024);
    floorGrad.addColorStop(0, env.floorColor);
    floorGrad.addColorStop(1, '#0e0d13');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 724, 2048, 300);

    // Floor planks / tiles
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 3;
    for (let x = 0; x < 2048; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, 724);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  // Build 3D Voxel Avatar Model (Roblox / Minecraft Style)
  const buildVoxelAvatar = (settings: typeof avatarSettings) => {
    const avatarGroup = new THREE.Group();

    // 1. Head (Voxel Cube)
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const skinMat = new THREE.MeshStandardMaterial({ color: settings.skinColor, roughness: 0.6 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.8;
    avatarGroup.add(head);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: '#111111' });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    leftEye.position.set(-0.2, 1.85, 0.41);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    rightEye.position.set(0.2, 1.85, 0.41);
    avatarGroup.add(leftEye, rightEye);

    // Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: settings.hairColor, roughness: 0.8 });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.85), hairMat);
    hair.position.set(0, 2.15, 0);
    avatarGroup.add(hair);

    // Hachimaki Headband (Accessory)
    if (settings.accessory === 'hachimaki') {
      const headbandMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
      const headband = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.16, 0.86), headbandMat);
      headband.position.set(0, 1.95, 0);
      avatarGroup.add(headband);

      // Red sun emblem in center of headband
      const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: '#e63946' }));
      emblem.position.set(0, 1.95, 0.44);
      avatarGroup.add(emblem);
    }

    // 2. Torso (Kimono / Shirt)
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5);
    const shirtMat = new THREE.MeshStandardMaterial({ color: settings.shirtColor, roughness: 0.5 });
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.95;
    avatarGroup.add(torso);

    // Obi (Belt)
    const obi = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.22, 0.52), new THREE.MeshStandardMaterial({ color: '#ffb703' }));
    obi.position.y = 0.75;
    avatarGroup.add(obi);

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.35, 1.0, 0.35);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(-0.65, 0.95, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.set(0.65, 0.95, 0);
    avatarGroup.add(leftArm, rightArm);

    // 4. Legs (Hakama / Pants)
    const legGeo = new THREE.BoxGeometry(0.4, 0.9, 0.45);
    const pantsMat = new THREE.MeshStandardMaterial({ color: settings.pantsColor, roughness: 0.7 });
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.23, 0.0, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.23, 0.0, 0);
    avatarGroup.add(leftLeg, rightLeg);

    avatarGroup.position.set(0, -2.8, -4.5);
    avatarGroup.scale.set(1.1, 1.1, 1.1);
    return avatarGroup;
  };

  // Setup Three.js Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 360 Panoramic Sphere
    const sphereGeo = new THREE.SphereGeometry(300, 60, 40);
    sphereGeo.scale(-1, 1, 1); // Invert faces so texture is on the inside!
    const sphereMat = new THREE.MeshBasicMaterial({ map: createPanoramicTexture(selectedEnvKey) });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Add Voxel Avatar Model
    const voxelAvatar = buildVoxelAvatar(avatarSettings);
    scene.add(voxelAvatar);
    voxelGroupRef.current = voxelAvatar;

    // Add Hotspot Markers
    const hotspots = currentEnv.hotspots;
    const hotspotMeshes: THREE.Mesh[] = [];

    hotspots.forEach(h => {
      const markerGeo = new THREE.SphereGeometry(6, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: discoveredIds.includes(h.id) ? 0x22c55e : 0xf59e0b,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(h.position[0], h.position[1], h.position[2]);
      marker.userData = { hotspot: h };
      scene.add(marker);
      hotspotMeshes.push(marker);

      // Outer Pulse Ring
      const ringGeo = new THREE.RingGeometry(8, 11, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(marker.position);
      ring.lookAt(camera.position);
      scene.add(ring);
    });

    hotspotMeshesRef.current = hotspotMeshes;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle avatar breathing bob
      if (voxelGroupRef.current) {
        const time = clock.getElapsedTime();
        voxelGroupRef.current.position.y = -2.8 + Math.sin(time * 2) * 0.05;
      }

      // Hotspots pulsing glow
      hotspotMeshes.forEach((mesh, idx) => {
        const s = 1 + Math.sin(clock.getElapsedTime() * 4 + idx) * 0.15;
        mesh.scale.set(s, s, s);
      });

      // Update Camera based on Lat / Lon
      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
      cameraTarget.y = 500 * Math.cos(phi);
      cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(cameraTarget);

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [selectedEnvKey, avatarSettings, discoveredIds]);

  // Pointer Interaction Handlers for 360 Dragging & Hotspot Raycasting
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    lonRef.current += deltaX * 0.15;
    latRef.current -= deltaY * 0.15;

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const moved = Math.hypot(
      e.clientX - previousMousePosition.current.x,
      e.clientY - previousMousePosition.current.y
    );
    isDragging.current = false;

    // Raycast on click if user didn't drag
    if (moved < 5 && canvasRef.current && cameraRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(hotspotMeshesRef.current);

      if (intersects.length > 0) {
        const item = intersects[0].object.userData.hotspot as HotspotItem;
        setActiveHotspot(item);
        setSelectedQuizOption(null);
        setQuizFeedback(null);
      }
    }
  };

  // Submit Hotspot Observation Quiz Answer
  const handleAnswerQuiz = (chosen: string) => {
    if (!activeHotspot || selectedQuizOption !== null) return;
    setSelectedQuizOption(chosen);

    const isCorrect = chosen.startsWith(activeHotspot.kanji);
    if (isCorrect) {
      setQuizFeedback('Tepat sekali! Kepekaan observasi Anda sangat tajam!');
      confetti({ particleCount: 50, spread: 60 });
      if (!discoveredIds.includes(activeHotspot.id)) {
        setDiscoveredIds(prev => [...prev, activeHotspot.id]);
      }
    } else {
      setQuizFeedback(`Kurang tepat. Benda ini adalah 「${activeHotspot.kanji}」 (${activeHotspot.reading}).`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#161420]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="game-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lobby</span>
          </Link>

          <div>
            <div className="text-xs font-black text-white flex items-center space-x-2">
              <Box className="w-4 h-4 text-cyan-400" />
              <span>360° Voxel Explorer (H5P Clone)</span>
            </div>
            <div className="text-[10px] text-stone-400">
              Lokasi: <strong className="text-white">{currentEnv.nameJa}</strong>
            </div>
          </div>
        </div>

        {/* Environment Picker & Voxel Customizer Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/10">
            {Object.keys(ROOM_ENVIRONMENTS).map(key => (
              <button
                key={key}
                onClick={() => {
                  setSelectedEnvKey(key);
                  setActiveHotspot(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedEnvKey === key
                    ? 'bg-cyan-500 text-stone-950 font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {ROOM_ENVIRONMENTS[key].name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCustomizer(c => !c)}
            className="game-btn-gold px-3 py-1.5 text-xs font-black flex items-center space-x-1.5"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Avatar Voxel</span>
          </button>
        </div>
      </header>

      {/* 360° Interactive Viewport */}
      <div className="relative flex-1 w-full h-[calc(100vh-120px)] overflow-hidden cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        {/* HUD Overlay: Discovery Counter & Guidance */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col space-y-2">
          <div className="px-3.5 py-2 rounded-2xl bg-[#161420]/80 backdrop-blur-md border border-white/10 text-xs font-bold flex items-center space-x-2 shadow-lg">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Klik & geser layar untuk menjelajahi 360°</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center space-x-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Ditemukan: {discoveredIds.length} / {currentEnv.hotspots.length} Objek
            </span>
          </div>
        </div>

        {/* HOTSPOT OBJECT MODAL / DRAWER */}
        {activeHotspot && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[92%] bg-[#161420]/95 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">
                  Objek Terdeteksi
                </span>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-stone-300 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Kanji & Pure Kana Reading */}
            <div className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {activeHotspot.kanji}
              </div>
              <div className="text-sm font-bold text-red-400">
                ({activeHotspot.reading})
              </div>
              <div className="text-xs text-stone-300">
                Arti: <strong className="text-amber-400">{activeHotspot.meaningId}</strong>
              </div>
            </div>

            {/* Observation Quiz Drill */}
            <div className="space-y-2 pt-2">
              <div className="text-xs text-stone-300 font-bold">
                {activeHotspot.quizPrompt}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeHotspot.quizOptions.map((opt, i) => {
                  const isSelected = selectedQuizOption === opt;
                  const isCorrect = opt.startsWith(activeHotspot.kanji);

                  let btnStyle = 'bg-[#201d2c] border-white/10 hover:border-cyan-400 text-stone-200';
                  if (selectedQuizOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-red-950/60 border-red-500 text-red-300 font-bold';
                    } else {
                      btnStyle = 'opacity-30 bg-stone-900 border-transparent text-stone-600';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedQuizOption !== null}
                      onClick={() => handleAnswerQuiz(opt)}
                      className={`p-3 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedQuizOption !== null && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div className="p-3 rounded-xl bg-white/5 text-xs text-stone-300 font-medium">
                  {quizFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AVATAR CUSTOMIZATION DRAWER */}
        {showCustomizer && (
          <div className="absolute top-16 right-4 z-30 w-80 bg-[#161420]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-xs font-black text-white flex items-center space-x-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Kustomisasi Avatar Voxel</span>
              </div>
              <button
                onClick={() => setShowCustomizer(false)}
                className="w-6 h-6 rounded-full bg-white/10 text-stone-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Skin Tone */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400">Warna Kulit:</div>
              <div className="flex space-x-2">
                {['#f4c29f', '#e0ac69', '#c68642', '#8d5524'].map(color => (
                  <button
                    key={color}
                    onClick={() => setAvatarSettings(s => ({ ...s, skinColor: color }))}
                    className={`w-7 h-7 rounded-full border-2 ${
                      avatarSettings.skinColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Kimono / Shirt Color */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400">Warna Kimono / Baju:</div>
              <div className="flex space-x-2">
                {['#8f2222', '#1d3557', '#2a9d8f', '#e76f51', '#222222'].map(color => (
                  <button
                    key={color}
                    onClick={() => setAvatarSettings(s => ({ ...s, shirtColor: color }))}
                    className={`w-7 h-7 rounded-full border-2 ${
                      avatarSettings.shirtColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Hakama / Pants Color */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400">Warna Hakama / Celana:</div>
              <div className="flex space-x-2">
                {['#1e1b18', '#264653', '#ffffff', '#4a4e69'].map(color => (
                  <button
                    key={color}
                    onClick={() => setAvatarSettings(s => ({ ...s, pantsColor: color }))}
                    className={`w-7 h-7 rounded-full border-2 ${
                      avatarSettings.pantsColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Accessory */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400">Aksesoris Kepala:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'hachimaki', label: 'Hachimaki (鉢巻)' },
                  { id: 'none', label: 'Tanpa Aksesoris' },
                ].map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setAvatarSettings(s => ({ ...s, accessory: acc.id }))}
                    className={`py-2 px-3 rounded-xl border font-bold text-center ${
                      avatarSettings.accessory === acc.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-[#1e1b29] border-white/5 text-stone-400'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveAvatar}
              className="game-btn-primary w-full py-2.5 text-xs font-black mt-2"
            >
              Simpan Tampilan Avatar
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Stats */}
      <footer className="border-t border-white/10 bg-[#161420] px-4 py-3 text-xs text-stone-400 flex items-center justify-between z-20">
        <div>
          Lokasi Aktif: <strong className="text-white">{currentEnv.name}</strong>
        </div>
        <div className="text-[11px] text-stone-500">
          Avatar Voxel 3D • H5P 360° Panorama WebGL
        </div>
      </footer>
    </div>
  );
}
