import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAnalyses, hospitalSnapshots } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const hospitalId = searchParams.get('hospital_id');
    const limitParam = searchParams.get('limit');

    // Validate required hospital_id parameter
    if (!hospitalId) {
      return NextResponse.json(
        { 
          error: 'hospital_id parameter is required',
          code: 'MISSING_HOSPITAL_ID'
        },
        { status: 400 }
      );
    }

    // Parse and validate limit parameter
    const limit = Math.min(
      parseInt(limitParam || '10'),
      50
    );

    // Query predictions with joined snapshots
    const results = await db
      .select({
        id: aiAnalyses.id,
        snapshot_id: aiAnalyses.snapshotId,
        risk_level: aiAnalyses.risk,
        predicted_additional_patients_6h: aiAnalyses.predictedAdditionalPatients6h,
        recommended_actions: aiAnalyses.recommendedActions,
        alert_message: aiAnalyses.alertMessage,
        confidence_score: aiAnalyses.confidenceScore,
        created_at: aiAnalyses.snapshotId,
        snapshot: {
          id: hospitalSnapshots.id,
          hospital_id: hospitalSnapshots.hospitalId,
          timestamp: hospitalSnapshots.timestamp,
          beds_total: hospitalSnapshots.bedsTotal,
          beds_free: hospitalSnapshots.bedsFree,
          doctors_on_shift: hospitalSnapshots.doctorsOnShift,
          nurses_on_shift: hospitalSnapshots.nursesOnShift,
          oxygen_cylinders: hospitalSnapshots.oxygenCylinders,
          ventilators: hospitalSnapshots.ventilators,
          medicines: hospitalSnapshots.medicines,
          incoming_emergencies: hospitalSnapshots.incomingEmergencies,
          incident_description: hospitalSnapshots.newsSummary,
          aqi: hospitalSnapshots.aqi,
          festival: hospitalSnapshots.festival,
          news_summary: hospitalSnapshots.newsSummary,
          created_at: hospitalSnapshots.timestamp,
        }
      })
      .from(aiAnalyses)
      .innerJoin(hospitalSnapshots, eq(aiAnalyses.snapshotId, hospitalSnapshots.id))
      .where(eq(hospitalSnapshots.hospitalId, hospitalId))
      .orderBy(desc(hospitalSnapshots.timestamp))
      .limit(limit);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}