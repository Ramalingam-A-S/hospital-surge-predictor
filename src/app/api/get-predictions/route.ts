import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { predictions, snapshots } from '@/db/schema';
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
        id: predictions.id,
        snapshot_id: predictions.snapshotId,
        risk_level: predictions.riskLevel,
        predicted_additional_patients_6h: predictions.predictedAdditionalPatients6h,
        recommended_actions: predictions.recommendedActions,
        alert_message: predictions.alertMessage,
        confidence_score: predictions.confidenceScore,
        created_at: predictions.createdAt,
        snapshot: {
          id: snapshots.id,
          hospital_id: snapshots.hospitalId,
          timestamp: snapshots.timestamp,
          beds_total: snapshots.bedsTotal,
          beds_free: snapshots.bedsFree,
          doctors_on_shift: snapshots.doctorsOnShift,
          nurses_on_shift: snapshots.nursesOnShift,
          oxygen_cylinders: snapshots.oxygenCylinders,
          ventilators: snapshots.ventilators,
          medicines: snapshots.medicines,
          incoming_emergencies: snapshots.incomingEmergencies,
          incident_description: snapshots.incidentDescription,
          aqi: snapshots.aqi,
          festival: snapshots.festival,
          news_summary: snapshots.newsSummary,
          created_at: snapshots.createdAt,
        }
      })
      .from(predictions)
      .innerJoin(snapshots, eq(predictions.snapshotId, snapshots.id))
      .where(eq(snapshots.hospitalId, hospitalId))
      .orderBy(desc(predictions.createdAt))
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