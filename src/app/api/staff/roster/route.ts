import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staffRoster } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospital_id');

    // Validate hospital_id is provided
    if (!hospitalId) {
      return NextResponse.json({ 
        error: 'hospital_id is required',
        code: 'MISSING_HOSPITAL_ID' 
      }, { status: 400 });
    }

    // Query staffRoster table
    const results = await db.select()
      .from(staffRoster)
      .where(eq(staffRoster.hospitalId, hospitalId))
      .orderBy(asc(staffRoster.name));

    // Transform results to match response format
    const formattedResults = results.map(staff => ({
      id: staff.id,
      staff_id: staff.staffId,
      name: staff.name,
      role: staff.role,
      hospital_id: staff.hospitalId,
      on_shift: staff.onShift,
      phone: staff.phone
    }));

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}