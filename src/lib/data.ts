import levelsData from '@/data/levels.json';
import vocabData from '@/data/vocabulary.json';
import kanjiData from '@/data/kanji.json';
import bunpouData from '@/data/bunpou.json';
import audioData from '@/data/audio.json';
import illustrationsData from '@/data/illustrations.json';
import quizzesData from '@/data/quizzes.json';
import worksheetsData from '@/data/worksheets.json';

export interface LevelInfo {
  id: string;
  levelCode: string;
  japaneseTitle: string;
  romajiTitle: string;
  title: string;
  color: string;
  description: string;
  lessons: LessonMeta[];
}

export interface LessonMeta {
  lessonNum: number;
  topic: string;
  title: string;
  vocabCount: number;
  kanjiCount: number;
  bunpouCount: number;
  audioCount: number;
  illustrationCount: number;
}

export interface Vocabulary {
  id: string;
  order50: number;
  orderList: number;
  kanji: string;
  reading: string;
  pitch: string;
  romaji: string;
  meaningEn: string;
  meaningId: string;
  partOfSpeech: string;
  note: string;
  level: string;
  levelJapanese: string;
  lesson: number;
  activity: string;
  subActivity: string;
  isReentry: boolean;
  firstAppear: string;
  isReference: boolean;
}

export interface KanjiItem {
  id: number;
  rawId: number;
  status: string;
  kanji: string;
  reading: string;
  word: string;
  kunyomi: string;
  wordId: number;
  level: string;
  levelJapanese: string;
  lesson: number;
  meaning: string;
}

export interface BunpouItem {
  id: string;
  level: string;
  levelJapanese: string;
  lesson: number;
  topic: string;
  lessonTitle: string;
  num: string;
  pattern: string;
  example: string;
  marugoto: string;
}

export interface AudioItem {
  id: string;
  level: string;
  lesson: number;
  trackNum: string;
  activityType: string;
  label: string;
  filename: string;
  src: string;
}

export interface IllustrationItem {
  id: string;
  level: string;
  lesson: number;
  folder: string;
  filename: string;
  title: string;
  src: string;
}

export interface QuizQuestion {
  id: string;
  type: 'vocab_jp_id' | 'vocab_id_jp' | 'kanji_reading' | 'grammar' | 'listening';
  prompt: string;
  word?: string;
  reading?: string;
  romaji?: string;
  pitch?: string;
  context?: string;
  audioSrc?: string;
  audioLabel?: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface ChapterQuiz {
  level: string;
  lesson: number;
  topic: string;
  title: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

export function getLevels(): LevelInfo[] {
  return levelsData as LevelInfo[];
}

export function getLevel(levelId: string): LevelInfo | undefined {
  return (levelsData as LevelInfo[]).find(l => l.id === levelId);
}

export function getLesson(levelId: string, lessonNum: number) {
  const lvl = getLevel(levelId);
  if (!lvl) return undefined;
  return lvl.lessons.find(ls => ls.lessonNum === lessonNum);
}

export function getVocabByLesson(levelId: string, lessonNum: number): Vocabulary[] {
  return (vocabData as Vocabulary[]).filter(v => v.level === levelId && v.lesson === lessonNum);
}

export function getKanjiByLesson(levelId: string, lessonNum: number): KanjiItem[] {
  return (kanjiData as KanjiItem[]).filter(k => k.level === levelId && k.lesson === lessonNum);
}

export function getBunpouByLesson(levelId: string, lessonNum: number): BunpouItem[] {
  return (bunpouData as BunpouItem[]).filter(b => b.level === levelId && b.lesson === lessonNum);
}

export function getAudioByLesson(levelId: string, lessonNum: number): AudioItem[] {
  return (audioData as AudioItem[]).filter(a => a.level === levelId && a.lesson === lessonNum);
}

export function getIllustrationsByLesson(levelId: string, lessonNum: number): IllustrationItem[] {
  return (illustrationsData as IllustrationItem[]).filter(i => i.level === levelId && i.lesson === lessonNum);
}

export function getQuizByLesson(levelId: string, lessonNum: number): ChapterQuiz | undefined {
  return (quizzesData as ChapterQuiz[]).find(q => q.level === levelId && q.lesson === lessonNum);
}

export function getAllQuizzes(levelId?: string): ChapterQuiz[] {
  if (levelId) {
    return (quizzesData as ChapterQuiz[]).filter(q => q.level === levelId);
  }
  return quizzesData as ChapterQuiz[];
}

export function searchAll(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { vocabs: [], kanjis: [], bunpous: [] };

  const vocabs = (vocabData as Vocabulary[]).filter(v =>
    v.kanji.toLowerCase().includes(q) ||
    v.reading.toLowerCase().includes(q) ||
    v.romaji.toLowerCase().includes(q) ||
    v.meaningId.toLowerCase().includes(q)
  ).slice(0, 50);

  const kanjis = (kanjiData as KanjiItem[]).filter(k =>
    k.kanji.toLowerCase().includes(q) ||
    k.reading.toLowerCase().includes(q) ||
    k.word.toLowerCase().includes(q) ||
    k.kunyomi.toLowerCase().includes(q) ||
    k.meaning.toLowerCase().includes(q)
  ).slice(0, 30);

  const bunpous = (bunpouData as BunpouItem[]).filter(b =>
    b.pattern.toLowerCase().includes(q) ||
    b.example.toLowerCase().includes(q) ||
    b.topic.toLowerCase().includes(q) ||
    b.lessonTitle.toLowerCase().includes(q)
  ).slice(0, 30);

  return { vocabs, kanjis, bunpous };
}

export interface WorksheetItem {
  id: string;
  level: string;
  levelName: string;
  type: string;
  category: string;
  filename: string;
  title: string;
  displayTitle: string;
  lesson: number;
  topic: string;
  url: string;
  questionCount: number;
  hasAudio: boolean;
  quiz: ChapterQuiz;
}

export function getWorksheets(): WorksheetItem[] {
  return worksheetsData as unknown as WorksheetItem[];
}
