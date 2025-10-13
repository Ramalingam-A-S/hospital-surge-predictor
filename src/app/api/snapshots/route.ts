import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snapshots, predictions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
      parseInt(limitParam || '20'),
      100
    );

    // Query snapshots with left join to predictions
    const results = await db
      .select({
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
        prediction_id: predictions.id,
        prediction_risk_level: predictions.riskLevel,
        prediction_patients_6h: predictions.predictedAdditionalPatients6h,
        prediction_actions: predictions.recommendedActions,
        prediction_alert: predictions.alertMessage,
        prediction_confidence: predictions.confidenceScore,
        prediction_created_at: predictions.createdAt,
      })
      .from(snapshots)
      .leftJoin(predictions, eq(snapshots.id, predictions.snapshotId))
      .where(eq(snapshots.hospitalId, hospitalId))
      .orderBy(desc(snapshots.createdAt))
      .limit(limit);

    // Transform results to handle null predictions
    const formattedResults = results.map(row => ({
      id: row.id,
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
      incident_description: row.incident_description,
      aqi: row.aqi,
      festival: row.festival,
      news_summary: row.news_summary,
      created_at: row.created_at,
      prediction: row.prediction_id !== null ? {
        id: row.prediction_id,
        risk_level: row.prediction_risk_level,
        predicted_additional_patients_6h: row.prediction_patients_6h,
        recommended_actions: row.prediction_actions,
        alert_message: row.prediction_alert,
        confidence_score: row.prediction_confidence,
        created_at: row.prediction_created_at,
      } : null
    }));

    return NextResponse.json(formattedResults, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}