import { pgTable, text, varchar, integer, timestamp, bigint, jsonb, boolean } from 'drizzle-orm/pg-core';

// 1. Users table (aligned with existing Neon schema)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkId: varchar('clerk_id').notNull().unique(),
  email: varchar('email').notNull().unique(),
  name: varchar('name'),
  role: varchar('role').notNull().default('student'),
  targetExamDate: timestamp('target_exam_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 2. Battle Rooms (aligned with existing Neon schema)
export const battleRooms = pgTable('battle_rooms', {
  id: text('id').primaryKey(),
  mode: text('mode').notNull(), // 'kanji' | 'kotoba' | 'image' | 'sentence' | 'listening'
  roomCode: text('room_code').notNull(),
  requiredCount: integer('required_count').notNull(),
  status: text('status').notNull(), // 'waiting' | 'in_progress' | 'finished'
  countdownSeconds: integer('countdown_seconds').notNull(),
  topicLevel: text('topic_level').notNull(), // 'a1' | 'a2-1' | 'a2-2'
  topicChapter: integer('topic_chapter').notNull(),
  topicCategory: text('topic_category').notNull(),
  participants: jsonb('participants').notNull().default([]),
  questions: jsonb('questions'),
  battleLog: jsonb('battle_log'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

// 3. Battle Match History
export const battleMatchHistory = pgTable('battle_match_history', {
  id: text('id').primaryKey(),
  roomCode: text('room_code').notNull(),
  mode: text('mode').notNull(),
  topicLevel: text('topic_level').notNull(),
  topicChapter: integer('topic_chapter').notNull(),
  topicCategory: text('topic_category').notNull(),
  winnerEmail: text('winner_email'),
  winnerScore: integer('winner_score'),
  participantCount: integer('participant_count'),
  participantsData: jsonb('participants_data'),
  playedAt: bigint('played_at', { mode: 'number' }),
});

// 4. Can-Do Adventure Progression
export const canDoProgress = pgTable('can_do_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  level: varchar('level', { length: 10 }).notNull(), // 'a1', 'a2-1', 'a2-2'
  lessonNum: integer('lesson_num').notNull(), // 1 - 18
  canDoTitle: text('can_do_title').notNull(),
  stars: integer('stars').notNull().default(0), // 0 to 3
  score: integer('score').notNull().default(0),
  isUnlocked: boolean('is_unlocked').notNull().default(false),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 5. Survival Records (Solo & Team)
export const survivalRecords = pgTable('survival_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  mode: varchar('mode', { length: 10 }).notNull(), // 'solo' | 'team'
  waveReached: integer('wave_reached').notNull(),
  score: integer('score').notNull(),
  accuracyPercent: integer('accuracy_percent').notNull(),
  correctCount: integer('correct_count').notNull(),
  wrongCount: integer('wrong_count').notNull(),
  teammates: jsonb('teammates').default([]), // For team co-op survival
  playedAt: timestamp('played_at').notNull().defaultNow(),
});

// 6. Avatar & Player Economy (Voxel / Roblox / Minecraft Customization)
export const avatarProfiles = pgTable('avatar_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  displayName: varchar('display_name', { length: 50 }),
  equippedTitle: varchar('equipped_title', { length: 50 }).default('Novice Ninja'),
  yenCoins: integer('yen_coins').notNull().default(500), // Starting currency
  exp: integer('exp').notNull().default(0),
  levelRank: integer('level_rank').notNull().default(1),
  // Voxel customization
  skinColor: varchar('skin_color', { length: 20 }).default('#f4c29f'),
  hairStyle: varchar('hair_style', { length: 30 }).default('classic'),
  hairColor: varchar('hair_color', { length: 20 }).default('#2b221b'),
  shirtColor: varchar('shirt_color', { length: 20 }).default('#8f2222'), // Red kimono/shirt
  pantsColor: varchar('pants_color', { length: 20 }).default('#1e1b18'), // Hakama / sumi pants
  accessory: varchar('accessory', { length: 30 }).default('hachimaki'), // headband, cat ears, glasses
  unlockedItems: jsonb('unlocked_items').default(['classic', 'hachimaki']),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
