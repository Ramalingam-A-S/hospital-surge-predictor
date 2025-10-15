import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wellnessMetrics } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json({ 
        error: 'user_id is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTimestamp = cutoffDate.toISOString();

    const results = await db.select()
      .from(wellnessMetrics)
      .where(
        and(
          eq(wellnessMetrics.userId, userId),
          gte(wellnessMetrics.timestamp, cutoffTimestamp)
        )
      )
      .orderBy(desc(wellnessMetrics.timestamp));

    const formattedResults = results.map(record => ({
      id: record.id,
      user_id: record.userId,
      timestamp: record.timestamp,
      mood_score: record.moodScore,
      note: record.note
    }));

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, mood_score, note } = body;

    if (!user_id) {
      return NextResponse.json({ 
        error: 'user_id is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (mood_score === undefined || mood_score === null) {
      return NextResponse.json({ 
        error: 'mood_score is required',
        code: 'MISSING_MOOD_SCORE' 
      }, { status: 400 });
    }

    const moodScoreNum = parseInt(mood_score);
    if (isNaN(moodScoreNum) || moodScoreNum < 1 || moodScoreNum > 10) {
      return NextResponse.json({ 
        error: 'mood_score must be between 1 and 10',
        code: 'INVALID_MOOD_SCORE' 
      }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const newMetric = await db.insert(wellnessMetrics)
      .values({
        userId: user_id,
        timestamp,
        moodScore: moodScoreNum,
        note: note || null
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      id: newMetric[0].id,
      timestamp: newMetric[0].timestamp
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}