import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses, hospitals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

interface SnapshotInput {
  hospital_id: string;
  timestamp?: string;
  beds_total: number;
  beds_free: number;
  doctors_on_shift: number;
  nurses_on_shift: number;
  oxygen_cylinders: number;
  ventilators: number;
  medicines?: any;
  incoming_emergencies: number;
  aqi?: number;
  festival?: string;
  news_summary?: string;
}

export async function POST(request: NextRequest) {
  try {
    const snapshotData = await request.json();

    // Validate required fields
    if (!snapshotData.hospital_id || snapshotData.beds_total === undefined || snapshotData.beds_free === undefined ||
        snapshotData.doctors_on_shift === undefined || snapshotData.nurses_on_shift === undefined ||
        snapshotData.oxygen_cylinders === undefined || snapshotData.ventilators === undefined ||
        snapshotData.incoming_emergencies === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Check if hospital exists
    const hospital = await db.select()
      .from(hospitals)
      .where(eq(hospitals.hospitalId, snapshotData.hospital_id))
      .limit(1);

    if (hospital.length === 0) {
      return NextResponse.json(
        { error: 'Hospital not found', code: 'HOSPITAL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Step 1: Save snapshot to database
    const snapshotTimestamp = snapshotData.timestamp || new Date().toISOString();
    const newSnapshot = await db.insert(hospitalSnapshots)
      .values({
        hospitalId: snapshotData.hospital_id,
        timestamp: snapshotTimestamp,
        bedsTotal: snapshotData.beds_total,
        bedsFree: snapshotData.beds_free,
        doctorsOnShift: snapshotData.doctors_on_shift,
        nursesOnShift: snapshotData.nurses_on_shift,
        oxygenCylinders: snapshotData.oxygen_cylinders,
        ventilators: snapshotData.ventilators,
        medicines: snapshotData.medicines || null,
        incomingEmergencies: snapshotData.incoming_emergencies,
        aqi: snapshotData.aqi || null,
        festival: snapshotData.festival || null,
        newsSummary: snapshotData.news_summary || null,
      })
      .returning();

    if (!newSnapshot || newSnapshot.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create snapshot', code: 'SNAPSHOT_CREATE_FAILED' },
        { status: 500 }
      );
    }

    const snapshotId = newSnapshot[0].id;

    // Run QuickCheck analysis
    const quickCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/quick_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshotData)
    });

    if (!quickCheckResponse.ok) {
      throw new Error('QuickCheck analysis failed');
    }

    const quickCheckResult = await quickCheckResponse.json();
    let finalAnalysis = null;

    // Auto-escalate to AgenticAnalysis if Medium/High risk or trigger_score >= 3
    if (quickCheckResult.risk === 'Medium' || quickCheckResult.risk === 'High' || quickCheckResult.trigger_score >= 3) {
      const agenticResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/agentic_analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: snapshotData,
          quick_check_result: quickCheckResult
        })
      });

      if (agenticResponse.ok) {
        finalAnalysis = await agenticResponse.json();
      } else {
        // Fallback to QuickCheck if AgenticAnalysis fails
        finalAnalysis = {
          risk: quickCheckResult.risk,
          predicted_additional_patients_6h: quickCheckResult.predicted_need_estimate,
          recommended_actions: [{ 
            step: 1, 
            type: 'advisory', 
            detail: quickCheckResult.recommended_quick_action, 
            urgency: quickCheckResult.risk.toLowerCase() 
          }],
          alert_message: `${quickCheckResult.risk} risk detected. ${quickCheckResult.recommended_quick_action}`,
          confidence: 0.75,
          reasoning: 'Quick-check based analysis (Agentic AI unavailable)',
          simulated_outcomes: null
        };
      }
    } else {
      // Low risk - use QuickCheck results
      finalAnalysis = {
        risk: quickCheckResult.risk,
        predicted_additional_patients_6h: quickCheckResult.predicted_need_estimate,
        recommended_actions: [{ 
          step: 1, 
          type: 'advisory', 
          detail: quickCheckResult.recommended_quick_action, 
          urgency: 'low' 
        }],
        alert_message: 'Hospital operations within normal parameters',
        confidence: 0.80,
        reasoning: 'Quick-check analysis - low risk scenario',
        simulated_outcomes: null
      };
    }

    // Store AI analysis in database
    const analysisRecord = await db.insert(aiAnalyses).values({
      snapshot_id: newSnapshot[0].id,
      risk: finalAnalysis.risk,
      predicted_additional_patients_6h: finalAnalysis.predicted_additional_patients_6h,
      recommended_actions: finalAnalysis.recommended_actions,
      alert_message: finalAnalysis.alert_message,
      confidence: finalAnalysis.confidence,
      reasoning: finalAnalysis.reasoning || null,
      simulated_outcomes: finalAnalysis.simulated_outcomes || null,
      created_at: new Date()
    }).returning();

    // Trigger webhook notifications for High risk
    if (finalAnalysis.risk === 'High') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospital_id: snapshotData.hospital_id,
            risk: finalAnalysis.risk,
            predicted_additional_patients_6h: finalAnalysis.predicted_additional_patients_6h,
            recommended_actions: finalAnalysis.recommended_actions,
            alert_message: finalAnalysis.alert_message,
            confidence: finalAnalysis.confidence,
            channels: ['slack', 'twilio', 'email']
          })
        });
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      snapshot_id: newSnapshot[0].id,
      analysis_id: analysisRecord[0].id,
      hospital_id: snapshotData.hospital_id,
      risk: finalAnalysis.risk,
      predicted_additional_patients_6h: finalAnalysis.predicted_additional_patients_6h,
      recommended_actions: finalAnalysis.recommended_actions,
      alert_message: finalAnalysis.alert_message,
      confidence: finalAnalysis.confidence,
      reasoning: finalAnalysis.reasoning,
      simulated_outcomes: finalAnalysis.simulated_outcomes,
      quick_check: quickCheckResult,
      escalated: quickCheckResult.risk !== 'Low',
      webhook_triggered: finalAnalysis.risk === 'High'
    });

  } catch (error) {
    console.error('Snapshot save error:', error);
    return NextResponse.json(
      { error: 'Failed to save snapshot and analyze', details: String(error) },
      { status: 500 }
    );
  }
}