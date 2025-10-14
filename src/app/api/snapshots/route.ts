import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospital_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Parse and validate limit (default 50, max 200)
    const limit = Math.min(
      parseInt(limitParam || '50'),
      200
    );

    // Parse offset (default 0)
    const offset = parseInt(offsetParam || '0');

    // Validate date formats if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Invalid start_date format. Use ISO 8601 format.', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: 'Invalid end_date format. Use ISO 8601 format.', code: 'INVALID_END_DATE' },
        { status: 400 }
      );
    }

    // Build WHERE conditions
    const conditions = [];
    
    if (hospitalId) {
      conditions.push(eq(hospitalSnapshots.hospitalId, hospitalId));
    }
    
    if (startDate) {
      conditions.push(gte(hospitalSnapshots.timestamp, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(hospitalSnapshots.timestamp, endDate));
    }

    // Build and execute query
    let query = db
      .select({
        snapshotId: hospitalSnapshots.id,
        hospitalId: hospitalSnapshots.hospitalId,
        timestamp: hospitalSnapshots.timestamp,
        bedsTotal: hospitalSnapshots.bedsTotal,
        bedsFree: hospitalSnapshots.bedsFree,
        doctorsOnShift: hospitalSnapshots.doctorsOnShift,
        nursesOnShift: hospitalSnapshots.nursesOnShift,
        oxygenCylinders: hospitalSnapshots.oxygenCylinders,
        ventilators: hospitalSnapshots.ventilators,
        medicines: hospitalSnapshots.medicines,
        incomingEmergencies: hospitalSnapshots.incomingEmergencies,
        aqi: hospitalSnapshots.aqi,
        festival: hospitalSnapshots.festival,
        newsSummary: hospitalSnapshots.newsSummary,
        analysisId: aiAnalyses.id,
        risk: aiAnalyses.risk,
        predictedAdditionalPatients6h: aiAnalyses.predictedAdditionalPatients6h,
        recommendedActions: aiAnalyses.recommendedActions,
        alertMessage: aiAnalyses.alertMessage,
        confidenceScore: aiAnalyses.confidenceScore,
        capacityRatio: aiAnalyses.capacityRatio,
        reasoningSummary: aiAnalyses.reasoningSummary,
      })
      .from(hospitalSnapshots)
      .leftJoin(aiAnalyses, eq(hospitalSnapshots.id, aiAnalyses.snapshotId));

    // Apply WHERE conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering, limit, and offset
    const results = await query
      .orderBy(desc(hospitalSnapshots.timestamp))
      .limit(limit)
      .offset(offset);

    // Format response
    const formattedResults = results.map(row => ({
      snapshot_id: row.snapshotId,
      hospital_id: row.hospitalId,
      timestamp: row.timestamp,
      beds_total: row.bedsTotal,
      beds_free: row.bedsFree,
      capacity_ratio: row.capacityRatio,
      doctors_on_shift: row.doctorsOnShift,
      nurses_on_shift: row.nursesOnShift,
      oxygen_cylinders: row.oxygenCylinders,
      ventilators: row.ventilators,
      medicines: row.medicines,
      incoming_emergencies: row.incomingEmergencies,
      aqi: row.aqi,
      festival: row.festival,
      news_summary: row.newsSummary,
      analysis: row.analysisId !== null ? {
        id: row.analysisId,
        risk: row.risk,
        predicted_additional_patients_6h: row.predictedAdditionalPatients6h,
        recommended_actions: row.recommendedActions,
        alert_message: row.alertMessage,
        confidence_score: row.confidenceScore,
        reasoning_summary: row.reasoningSummary,
      } : null
    }));

    return NextResponse.json(formattedResults, { status: 200 });

  } catch (error) {
    console.error('GET /api/snapshots error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}