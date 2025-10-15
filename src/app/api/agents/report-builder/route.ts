import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAnalyses, hospitalSnapshots } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { hospital_id, analysis_id, report_type = 'summary' } = await request.json();

    if (!hospital_id) {
      return NextResponse.json(
        { error: 'hospital_id is required' },
        { status: 400 }
      );
    }

    let analysis;
    let snapshot;

    if (analysis_id) {
      // Get specific analysis
      analysis = await db
        .select()
        .from(aiAnalyses)
        .where(eq(aiAnalyses.id, analysis_id))
        .limit(1);
      
      if (analysis.length > 0 && analysis[0].snapshot_id) {
        snapshot = await db
          .select()
          .from(hospitalSnapshots)
          .where(eq(hospitalSnapshots.id, analysis[0].snapshot_id))
          .limit(1);
      }
    } else {
      // Get most recent analysis for hospital
      const recentSnapshots = await db
        .select()
        .from(hospitalSnapshots)
        .where(eq(hospitalSnapshots.hospital_id, hospital_id))
        .orderBy(desc(hospitalSnapshots.timestamp))
        .limit(1);

      if (recentSnapshots.length > 0) {
        snapshot = recentSnapshots;
        analysis = await db
          .select()
          .from(aiAnalyses)
          .where(eq(aiAnalyses.snapshot_id, recentSnapshots[0].id))
          .orderBy(desc(aiAnalyses.created_at))
          .limit(1);
      }
    }

    if (!analysis || analysis.length === 0) {
      return NextResponse.json(
        { error: 'No analysis data found' },
        { status: 404 }
      );
    }

    const analysisData = analysis[0];
    const snapshotData = snapshot && snapshot.length > 0 ? snapshot[0] : null;

    // Build report summary
    const report = {
      report_id: `RPT-${Date.now()}`,
      generated_at: new Date().toISOString(),
      hospital_id,
      report_type,
      
      // Executive Summary
      executive_summary: {
        risk_level: analysisData.risk,
        confidence: analysisData.confidence,
        alert_message: analysisData.alert_message,
        predicted_surge: `${analysisData.predicted_additional_patients_6h} additional patients in next 6 hours`
      },

      // Snapshot Details
      snapshot_data: snapshotData ? {
        timestamp: snapshotData.timestamp,
        total_beds: snapshotData.beds_total,
        available_beds: snapshotData.beds_free,
        capacity_utilization: `${Math.round(((snapshotData.beds_total - snapshotData.beds_free) / snapshotData.beds_total) * 100)}%`,
        doctors_on_shift: snapshotData.doctors_on_shift,
        nurses_on_shift: snapshotData.nurses_on_shift,
        oxygen_cylinders: snapshotData.oxygen_cylinders,
        ventilators: snapshotData.ventilators,
        incoming_emergencies: snapshotData.incoming_emergencies
      } : null,

      // AI Analysis
      analysis_details: {
        reasoning: analysisData.reasoning,
        recommended_actions: analysisData.recommended_actions || [],
        simulated_outcomes: analysisData.simulated_outcomes
      },

      // Resources Used (calculated)
      resources_assessment: {
        bed_pressure: snapshotData ? (snapshotData.beds_free < 20 ? 'High' : snapshotData.beds_free < 40 ? 'Medium' : 'Low') : 'Unknown',
        oxygen_status: snapshotData ? (snapshotData.oxygen_cylinders < 10 ? 'Critical' : snapshotData.oxygen_cylinders < 25 ? 'Low' : 'Adequate') : 'Unknown',
        ventilator_availability: snapshotData ? (snapshotData.ventilators < 3 ? 'Limited' : 'Adequate') : 'Unknown',
        staffing_ratio: snapshotData ? `1 doctor per ${Math.round(snapshotData.beds_total / Math.max(1, snapshotData.doctors_on_shift))} beds` : 'Unknown'
      },

      // Top Actions Summary
      priority_actions: (analysisData.recommended_actions || [])
        .slice(0, 3)
        .map((action: any, index: number) => ({
          priority: index + 1,
          type: action.type,
          action: action.detail,
          urgency: action.urgency
        })),

      // Report metadata
      metadata: {
        ai_confidence: `${Math.round((analysisData.confidence || 0) * 100)}%`,
        analysis_timestamp: analysisData.created_at,
        report_format: 'JSON',
        pdf_available: false, // Would be true if PDF generation implemented
        export_formats: ['JSON', 'CSV']
      }
    };

    return NextResponse.json({
      success: true,
      report,
      download_url: `/api/reports/${report.report_id}`, // Placeholder for future PDF download
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('ReportBuilder error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}