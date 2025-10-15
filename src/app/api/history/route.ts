import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
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

    const searchParams = request.nextUrl.searchParams;
    const hospitalId = searchParams.get('hospital_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Validate required hospital_id
    if (!hospitalId) {
      return NextResponse.json(
        { error: 'hospital_id is required', code: 'MISSING_HOSPITAL_ID' },
        { status: 400 }
      );
    }

    // Build where conditions
    const conditions = [eq(hospitalSnapshots.hospitalId, hospitalId)];

    // Add date filters if provided
    if (from) {
      try {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid from date format', code: 'INVALID_FROM_DATE' },
            { status: 400 }
          );
        }
        conditions.push(gte(hospitalSnapshots.timestamp, from));
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid from date format', code: 'INVALID_FROM_DATE' },
          { status: 400 }
        );
      }
    }

    if (to) {
      try {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid to date format', code: 'INVALID_TO_DATE' },
            { status: 400 }
          );
        }
        conditions.push(lte(hospitalSnapshots.timestamp, to));
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid to date format', code: 'INVALID_TO_DATE' },
          { status: 400 }
        );
      }
    }

    // Query with left join to include snapshots even without analyses
    const results = await db
      .select({
        snapshot_id: hospitalSnapshots.id,
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
        aqi: hospitalSnapshots.aqi,
        festival: hospitalSnapshots.festival,
        news_summary: hospitalSnapshots.newsSummary,
        analysis_id: aiAnalyses.id,
        risk: aiAnalyses.risk,
        predicted_additional_patients_6h: aiAnalyses.predictedAdditionalPatients6h,
        recommended_actions: aiAnalyses.recommendedActions,
        alert_message: aiAnalyses.alertMessage,
        confidence_score: aiAnalyses.confidenceScore,
        capacity_ratio: aiAnalyses.capacityRatio,
        reasoning_summary: aiAnalyses.reasoningSummary,
        reasoning: aiAnalyses.reasoning,
        simulated_outcomes: aiAnalyses.simulatedOutcomes,
        created_at: aiAnalyses.createdAt,
      })
      .from(hospitalSnapshots)
      .leftJoin(aiAnalyses, eq(hospitalSnapshots.id, aiAnalyses.snapshotId))
      .where(and(...conditions))
      .orderBy(desc(hospitalSnapshots.timestamp));

    // Transform results to match required format
    const snapshots = results.map((row) => ({
      snapshot_id: row.snapshot_id,
      hospital_id: row.hospital_id,
      timestamp: row.timestamp,
      beds_total: row.beds_total,
      beds_free: row.beds_free,
      doctors_on_shift: row.doctors_on_shift,
      nurses_on_shift: row.nurses_on_shift,
      oxygen_cylinders: row.oxygen_cylinders,
      ventilators: row.ventilators,
      medicines: row.medicines,
      incoming_emergencies: row.incoming_emergencies,
      aqi: row.aqi,
      festival: row.festival,
      news_summary: row.news_summary,
      analysis: row.analysis_id
        ? {
            id: row.analysis_id,
            risk: row.risk,
            predicted_additional_patients_6h: row.predicted_additional_patients_6h,
            recommended_actions: row.recommended_actions,
            alert_message: row.alert_message,
            confidence_score: row.confidence_score,
            capacity_ratio: row.capacity_ratio,
            reasoning_summary: row.reasoning_summary,
            reasoning: row.reasoning,
            simulated_outcomes: row.simulated_outcomes,
            created_at: row.created_at,
          }
        : null,
    }));

    return NextResponse.json({ snapshots }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}