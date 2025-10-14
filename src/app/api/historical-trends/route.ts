import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { eq, gte, asc } from 'drizzle-orm';
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
    const daysParam = searchParams.get('days');

    // Validate required hospital_id parameter
    if (!hospitalId) {
      return NextResponse.json(
        { 
          error: 'Hospital ID is required',
          code: 'MISSING_HOSPITAL_ID' 
        },
        { status: 400 }
      );
    }

    // Parse and validate days parameter
    let days = 7;
    if (daysParam) {
      const parsedDays = parseInt(daysParam);
      if (isNaN(parsedDays) || parsedDays < 1) {
        return NextResponse.json(
          { 
            error: 'Days parameter must be a positive number',
            code: 'INVALID_DAYS_PARAMETER' 
          },
          { status: 400 }
        );
      }
      days = Math.min(parsedDays, 30);
    }

    // Calculate cutoff timestamp
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTimestamp = cutoffDate.toISOString();

    // Query snapshots with predictions
    const results = await db
      .select({
        snapshotId: hospitalSnapshots.id,
        timestamp: hospitalSnapshots.timestamp,
        bedsTotal: hospitalSnapshots.bedsTotal,
        bedsFree: hospitalSnapshots.bedsFree,
        doctorsOnShift: hospitalSnapshots.doctorsOnShift,
        nursesOnShift: hospitalSnapshots.nursesOnShift,
        oxygenCylinders: hospitalSnapshots.oxygenCylinders,
        ventilators: hospitalSnapshots.ventilators,
        incomingEmergencies: hospitalSnapshots.incomingEmergencies,
        aqi: hospitalSnapshots.aqi,
        festival: hospitalSnapshots.festival,
        predictionId: aiAnalyses.id,
        riskLevel: aiAnalyses.risk,
        predictedAdditionalPatients6h: aiAnalyses.predictedAdditionalPatients6h,
        confidenceScore: aiAnalyses.confidenceScore,
      })
      .from(hospitalSnapshots)
      .leftJoin(aiAnalyses, eq(aiAnalyses.snapshotId, hospitalSnapshots.id))
      .where(
        eq(hospitalSnapshots.hospitalId, hospitalId)
      )
      .orderBy(asc(hospitalSnapshots.timestamp));

    // Filter by timestamp and format results
    const filteredResults = results.filter(
      result => result.timestamp >= cutoffTimestamp
    );

    const dataPoints = filteredResults.map(result => {
      const occupancyRate = result.bedsTotal > 0 
        ? parseFloat((((result.bedsTotal - result.bedsFree) / result.bedsTotal) * 100).toFixed(1))
        : 0;
      
      const staffOnShift = result.doctorsOnShift + result.nursesOnShift;

      return {
        timestamp: result.timestamp,
        snapshot_id: result.snapshotId,
        prediction_id: result.predictionId,
        risk_level: result.riskLevel,
        predicted_additional_patients_6h: result.predictedAdditionalPatients6h,
        occupancy_rate: occupancyRate,
        beds_total: result.bedsTotal,
        beds_free: result.bedsFree,
        staff_on_shift: staffOnShift,
        oxygen_cylinders: result.oxygenCylinders,
        ventilators: result.ventilators,
        incoming_emergencies: result.incomingEmergencies,
        aqi: result.aqi,
        festival: result.festival,
        confidence_score: result.confidenceScore,
      };
    });

    return NextResponse.json(
      {
        hospital_id: hospitalId,
        period_days: days,
        data_points: dataPoints,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}