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
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

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

    // Validate data ranges
    if (snapshotData.beds_total < 0 || snapshotData.beds_free < 0 || 
        snapshotData.beds_free > snapshotData.beds_total) {
      return NextResponse.json(
        { error: 'Invalid bed count values', code: 'INVALID_BED_COUNT' },
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
    let newSnapshot;
    try {
      const snapshotTimestamp = snapshotData.timestamp || new Date().toISOString();
      newSnapshot = await db.insert(hospitalSnapshots)
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
        throw new Error('Snapshot insert returned no data');
      }
    } catch (dbError) {
      console.error('Database snapshot insert error:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to create snapshot in database',
          code: 'SNAPSHOT_CREATE_FAILED',
          details: String(dbError)
        },
        { status: 500 }
      );
    }

    // Get auth token for internal API calls
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Step 2: Run QuickCheck analysis with auth
    let quickCheckResult;
    try {
      const quickCheckResponse = await fetch(`${request.nextUrl.origin}/api/quick_check`, {
        method: 'POST',
        headers,
        body: JSON.stringify(snapshotData)
      });

      if (!quickCheckResponse.ok) {
        const errorText = await quickCheckResponse.text();
        console.error('QuickCheck API error:', errorText);
        throw new Error(`QuickCheck failed with status ${quickCheckResponse.status}: ${errorText}`);
      }

      quickCheckResult = await quickCheckResponse.json();
    } catch (qcError) {
      console.error('QuickCheck error:', qcError);
      return NextResponse.json(
        { 
          error: 'QuickCheck analysis failed',
          code: 'QUICKCHECK_FAILED',
          details: String(qcError)
        },
        { status: 500 }
      );
    }

    // Step 3: Auto-escalate to AgenticAnalysis if Medium/High risk or trigger_score >= 3
    let finalAnalysis = null;
    
    if (quickCheckResult.risk === 'Medium' || quickCheckResult.risk === 'High' || quickCheckResult.trigger_score >= 3) {
      try {
        const agenticResponse = await fetch(`${request.nextUrl.origin}/api/agentic_analysis`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...snapshotData,
            quick_check_result: quickCheckResult
          })
        });

        if (agenticResponse.ok) {
          finalAnalysis = await agenticResponse.json();
        } else {
          console.error('AgenticAnalysis failed, using fallback');
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
      } catch (agenticError) {
        console.error('AgenticAnalysis error:', agenticError);
        // Use fallback
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

    // Step 4: Store AI analysis in database
    let analysisRecord;
    try {
      analysisRecord = await db.insert(aiAnalyses).values({
        snapshotId: newSnapshot[0].id,
        risk: finalAnalysis.risk,
        predictedAdditionalPatients6h: finalAnalysis.predicted_additional_patients_6h,
        recommendedActions: finalAnalysis.recommended_actions,
        alertMessage: finalAnalysis.alert_message,
        confidenceScore: finalAnalysis.confidence,
        reasoning: finalAnalysis.reasoning || null,
        simulatedOutcomes: finalAnalysis.simulated_outcomes || null,
      }).returning();

      if (!analysisRecord || analysisRecord.length === 0) {
        throw new Error('Analysis insert returned no data');
      }
    } catch (analysisDbError) {
      console.error('Database analysis insert error:', analysisDbError);
      return NextResponse.json(
        { 
          error: 'Failed to save analysis results to database',
          code: 'ANALYSIS_INSERT_FAILED',
          details: String(analysisDbError)
        },
        { status: 500 }
      );
    }

    // Step 5: Trigger webhook notifications for High risk
    if (finalAnalysis.risk === 'High') {
      try {
        await fetch(`${request.nextUrl.origin}/api/webhooks/notify`, {
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
      { 
        error: 'Failed to save snapshot and analyze',
        code: 'SNAPSHOT_PROCESSING_ERROR',
        details: String(error)
      },
      { status: 500 }
    );
  }
}