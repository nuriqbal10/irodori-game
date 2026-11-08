import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { avatarProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: true,
        avatar: {
          skinColor: '#f4c29f',
          hairStyle: 'classic',
          hairColor: '#2b221b',
          shirtColor: '#8f2222',
          pantsColor: '#1e1b18',
          accessory: 'hachimaki',
          yenCoins: 1000,
        },
      });
    }

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (dbUsers.length === 0) {
      return NextResponse.json({
        success: true,
        avatar: {
          skinColor: '#f4c29f',
          hairStyle: 'classic',
          hairColor: '#2b221b',
          shirtColor: '#8f2222',
          pantsColor: '#1e1b18',
          accessory: 'hachimaki',
          yenCoins: 1000,
        },
      });
    }

    const avatars = await db.select().from(avatarProfiles).where(eq(avatarProfiles.userId, dbUsers[0].id)).limit(1);
    return NextResponse.json({
      success: true,
      avatar: avatars[0] || {
        skinColor: '#f4c29f',
        hairStyle: 'classic',
        hairColor: '#2b221b',
        shirtColor: '#8f2222',
        pantsColor: '#1e1b18',
        accessory: 'hachimaki',
        yenCoins: 1000,
      },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { skinColor, hairColor, shirtColor, pantsColor, accessory } = body;

    if (!userId) {
      return NextResponse.json({ success: true, message: 'Saved locally for guest.' });
    }

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (dbUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await db
      .update(avatarProfiles)
      .set({
        skinColor,
        hairColor,
        shirtColor,
        pantsColor,
        accessory,
        updatedAt: new Date(),
      })
      .where(eq(avatarProfiles.userId, dbUsers[0].id));

    return NextResponse.json({ success: true, message: 'Avatar updated!' });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}
