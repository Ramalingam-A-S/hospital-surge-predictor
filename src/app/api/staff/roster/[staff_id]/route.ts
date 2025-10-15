import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staffRoster } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ staff_id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { staff_id } = await params;

    if (!staff_id) {
      return NextResponse.json(
        { error: 'Staff ID is required', code: 'MISSING_STAFF_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { on_shift } = body;

    if (on_shift === undefined || on_shift === null) {
      return NextResponse.json(
        { error: 'on_shift field is required', code: 'MISSING_ON_SHIFT' },
        { status: 400 }
      );
    }

    if (typeof on_shift !== 'boolean') {
      return NextResponse.json(
        { error: 'on_shift must be a boolean value', code: 'INVALID_ON_SHIFT_TYPE' },
        { status: 400 }
      );
    }

    const existingStaff = await db
      .select()
      .from(staffRoster)
      .where(eq(staffRoster.staffId, staff_id))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated = await db
      .update(staffRoster)
      .set({ onShift: on_shift })
      .where(eq(staffRoster.staffId, staff_id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update staff shift status', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    const updatedRecord = updated[0];

    return NextResponse.json(
      {
        id: updatedRecord.id,
        staff_id: updatedRecord.staffId,
        name: updatedRecord.name,
        role: updatedRecord.role,
        hospital_id: updatedRecord.hospitalId,
        on_shift: updatedRecord.onShift,
        phone: updatedRecord.phone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}