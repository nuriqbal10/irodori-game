export interface ChapterItem {
  id: string;
  textbook: 'IRODORI_A1' | 'IRODORI_A2_1' | 'IRODORI_A2_2' | 'MINNA_1' | 'MINNA_2';
  textbookName: string;
  chapterNumber: number;
  titleJapanese: string;
  titleIndonesian: string;
  targetCanDo: string;
  jlptLevel: 'JFT_A1' | 'JFT_A2' | 'N5' | 'N4';
  mapTheme: 'CLASSROOM_JP' | 'KONBINI' | 'GENBA_PABRIK' | 'KAIGO_CARE' | 'RESTAURANT';
  questionCount: number;
  recommendedDurationMin: number;
}

export const LPK_TEXTBOOKS = [
  { id: 'IRODORI_A1', name: 'Irodori Starter (A1)', tag: 'Dasar / Kehidupan Sehari-hari', level: 'JFT-Basic A1 / N5' },
  { id: 'IRODORI_A2_1', name: 'Irodori Shokyu 1 (A2.1)', tag: 'Komunikasi Kerja & Sosial', level: 'JFT-Basic A2 / N4' },
  { id: 'IRODORI_A2_2', name: 'Irodori Shokyu 2 (A2.2)', tag: 'Budaya Kerja & Tanggap Darurat', level: 'JFT-Basic A2 / N4' },
  { id: 'MINNA_1', name: 'Minna no Nihongo I', tag: 'Pondasi Tata Bahasa Baku', level: 'JLPT N5' },
  { id: 'MINNA_2', name: 'Minna no Nihongo II', tag: 'Pola Kalimat Lanjutan & Keigo', level: 'JLPT N4' },
];

export const LPK_CHAPTERS: ChapterItem[] = [
  // IRODORI A1
  {
    id: 'irodori_a1_ch1',
    textbook: 'IRODORI_A1',
    textbookName: 'Irodori Starter (A1)',
    chapterNumber: 1,
    titleJapanese: 'あいさつと 自己紹介',
    titleIndonesian: 'Aisatsu (Salam) & Perkenalan Diri',
    targetCanDo: 'Dapat menyapa rekan kerja, memperkenalkan nama/asal, dan merespons salam harian di lingkungan LPK/asrama.',
    jlptLevel: 'JFT_A1',
    mapTheme: 'CLASSROOM_JP',
    questionCount: 5,
    recommendedDurationMin: 10
  },
  {
    id: 'irodori_a1_ch2',
    textbook: 'IRODORI_A1',
    textbookName: 'Irodori Starter (A1)',
    chapterNumber: 2,
    titleJapanese: '家族と 友達',
    titleIndonesian: 'Keluarga & Teman (Kazoku to Tomodachi)',
    targetCanDo: 'Dapat menyebutkan anggota keluarga, status pekerjaan sederhana, dan menjawab pertanyaan tentang asal tempat tinggal.',
    jlptLevel: 'JFT_A1',
    mapTheme: 'CLASSROOM_JP',
    questionCount: 8,
    recommendedDurationMin: 12
  },
  {
    id: 'irodori_a1_ch3',
    textbook: 'IRODORI_A1',
    textbookName: 'Irodori Starter (A1)',
    chapterNumber: 3,
    titleJapanese: '好きな 食べ物',
    titleIndonesian: 'Makanan Kesukaan & Memesan di Restoran',
    targetCanDo: 'Dapat menyatakan makanan/minuman yang disukai serta memesan menu dasar di restoran atau konbini.',
    jlptLevel: 'JFT_A1',
    mapTheme: 'RESTAURANT',
    questionCount: 8,
    recommendedDurationMin: 15
  },
  {
    id: 'irodori_a1_ch5',
    textbook: 'IRODORI_A1',
    textbookName: 'Irodori Starter (A1)',
    chapterNumber: 5,
    titleJapanese: '朝から 夜まで',
    titleIndonesian: 'Rutinitas Sehari-hari (Jam & Aktivitas)',
    targetCanDo: 'Dapat memberitahukan jam bangun tidur, berangkat kerja, jam istirahat, dan waktu pulang kerja.',
    jlptLevel: 'JFT_A1',
    mapTheme: 'KONBINI',
    questionCount: 10,
    recommendedDurationMin: 15
  },

  // IRODORI A2.1
  {
    id: 'irodori_a21_ch7',
    textbook: 'IRODORI_A2_1',
    textbookName: 'Irodori Shokyu 1 (A2.1)',
    chapterNumber: 7,
    titleJapanese: '休みの 日',
    titleIndonesian: 'Hari Libur & Hobi (Yasumi no Hi)',
    targetCanDo: 'Dapat menceritakan kegiatan saat libur, hobi di akhir pekan, dan mengajak rekan kerja bepergian.',
    jlptLevel: 'JFT_A2',
    mapTheme: 'KONBINI',
    questionCount: 8,
    recommendedDurationMin: 12
  },
  {
    id: 'irodori_a21_ch10',
    textbook: 'IRODORI_A2_1',
    textbookName: 'Irodori Shokyu 1 (A2.1)',
    chapterNumber: 10,
    titleJapanese: '病気と 健康',
    titleIndonesian: 'Kesehatan & Izin Sakit di Tempat Kerja',
    targetCanDo: 'Dapat menjelaskan gejala sakit (demam, pusing) kepada atasan dan meminta izin istirahat lewat telepon.',
    jlptLevel: 'JFT_A2',
    mapTheme: 'KAIGO_CARE',
    questionCount: 10,
    recommendedDurationMin: 15
  },

  // MINNA NO NIHONGO 1
  {
    id: 'minna_ch14',
    textbook: 'MINNA_1',
    textbookName: 'Minna no Nihongo I',
    chapterNumber: 14,
    titleJapanese: '動詞の て形 (~てください)',
    titleIndonesian: 'Konjugasi Bentuk Te & Instruksi Kerja (~te kudasai)',
    targetCanDo: 'Dapat memahami dan merespons perintah/instruksi kerja dari mandor di pabrik/tempat kerja.',
    jlptLevel: 'N5',
    mapTheme: 'GENBA_PABRIK',
    questionCount: 10,
    recommendedDurationMin: 15
  },
  {
    id: 'minna_ch17',
    textbook: 'MINNA_1',
    textbookName: 'Minna no Nihongo I',
    chapterNumber: 17,
    titleJapanese: '動詞の ない形 (~ないでください)',
    titleIndonesian: 'Konjugasi Bentuk Nai & Larangan Keselamatan Kerja',
    targetCanDo: 'Dapat memahami rambu larangan keselamatan kerja (anzen) di area industri/pabrik.',
    jlptLevel: 'N5',
    mapTheme: 'GENBA_PABRIK',
    questionCount: 10,
    recommendedDurationMin: 15
  }
];
