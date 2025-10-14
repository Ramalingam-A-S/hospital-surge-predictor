import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAnalyses, hospitalSnapshots } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid snapshot ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const snapshotId = parseInt(id);

    const analysisResults = await db
      .select({
        analysisId: aiAnalyses.id,
        snapshotId: aiAnalyses.snapshotId,
        risk: aiAnalyses.risk,
        predictedAdditionalPatients6h: aiAnalyses.predictedAdditionalPatients6h,
        recommendedActions: aiAnalyses.recommendedActions,
        alertMessage: aiAnalyses.alertMessage,
        confidenceScore: aiAnalyses.confidenceScore,
        capacityRatio: aiAnalyses.capacityRatio,
        reasoningSummary: aiAnalyses.reasoningSummary,
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
      })
      .from(aiAnalyses)
      .innerJoin(
        hospitalSnapshots,
        eq(aiAnalyses.snapshotId, hospitalSnapshots.id)
      )
      .where(eq(aiAnalyses.snapshotId, snapshotId))
      .limit(1);

    if (analysisResults.length === 0) {
      return NextResponse.json(
        { error: 'Analysis not found for the specified snapshot', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const result = analysisResults[0];

    const response = {
      analysis_id: result.analysisId,
      snapshot_id: result.snapshotId,
      hospital_id: result.hospitalId,
      timestamp: result.timestamp,
      risk: result.risk,
      predicted_additional_patients_6h: result.predictedAdditionalPatients6h,
      recommended_actions: result.recommendedActions,
      alert_message: result.alertMessage,
      confidence_score: result.confidenceScore,
      capacity_ratio: result.capacityRatio,
      reasoning_summary: result.reasoningSummary,
      snapshot_data: {
        beds_total: result.bedsTotal,
        beds_free: result.bedsFree,
        doctors_on_shift: result.doctorsOnShift,
        nurses_on_shift: result.nursesOnShift,
        oxygen_cylinders: result.oxygenCylinders,
        ventilators: result.ventilators,
        medicines: result.medicines,
        incoming_emergencies: result.incomingEmergencies,
        aqi: result.aqi,
        festival: result.festival,
        news_summary: result.newsSummary,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}