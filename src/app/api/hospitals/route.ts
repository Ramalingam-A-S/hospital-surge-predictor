import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitals } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allHospitals = await db.select()
      .from(hospitals)
      .orderBy(asc(hospitals.name));

    return NextResponse.json(allHospitals, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}