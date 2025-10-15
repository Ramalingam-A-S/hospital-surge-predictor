import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staffRoster, hospitalSnapshots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { snapshot, hospital_id } = await request.json();

    if (!hospital_id) {
      return NextResponse.json(
        { error: 'hospital_id is required' },
        { status: 400 }
      );
    }

    // Fetch current staff roster for the hospital
    const staff = await db
      .select()
      .from(staffRoster)
      .where(eq(staffRoster.hospital_id, hospital_id));

    // Analyze risk level from snapshot
    const capacity_ratio = (snapshot.beds_free / Math.max(1, snapshot.beds_total)) * 100;
    const isHighRisk = capacity_ratio < 10 || snapshot.incoming_emergencies >= 8;

    const recommendations = [];

    if (isHighRisk) {
      // Count on-shift staff by role
      const onShiftStaff = staff.filter(s => s.on_shift);
      const doctors = onShiftStaff.filter(s => s.role === 'doctor').length;
      const nurses = onShiftStaff.filter(s => s.role === 'nurse').length;

      // Generate recommendations based on staff availability
      if (doctors < 5) {
        recommendations.push({
          from_unit: 'General Ward',
          to_unit: 'Emergency Room',
          role: 'doctor',
          qty: Math.min(2, 5 - doctors),
          urgency: 'high',
          reason: 'ER requires additional doctors due to surge prediction'
        });
      }

      if (nurses < 10) {
        recommendations.push({
          from_unit: 'Outpatient',
          to_unit: 'ICU',
          role: 'nurse',
          qty: Math.min(3, 10 - nurses),
          urgency: 'high',
          reason: 'ICU staffing reinforcement needed'
        });
      }

      // Add general surge preparation
      recommendations.push({
        from_unit: 'Administrative',
        to_unit: 'Triage',
        role: 'support_staff',
        qty: 2,
        urgency: 'medium',
        reason: 'Strengthen triage capacity for incoming emergencies'
      });
    } else {
      recommendations.push({
        from_unit: null,
        to_unit: null,
        role: null,
        qty: 0,
        urgency: 'low',
        reason: 'Current staffing levels are adequate for predicted patient load'
      });
    }

    return NextResponse.json({
      success: true,
      hospital_id,
      risk_level: isHighRisk ? 'High' : 'Low',
      current_staff: {
        total: staff.length,
        on_shift: staff.filter(s => s.on_shift).length,
        doctors: staff.filter(s => s.role === 'doctor' && s.on_shift).length,
        nurses: staff.filter(s => s.role === 'nurse' && s.on_shift).length
      },
      recommendations
    });

  } catch (error) {
    console.error('ShiftOptimizer error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize shift allocation' },
      { status: 500 }
    );
  }
}