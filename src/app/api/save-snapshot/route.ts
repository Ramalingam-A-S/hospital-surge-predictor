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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body: SnapshotInput = await request.json();
    const {
      hospital_id,
      timestamp,
      beds_total,
      beds_free,
      doctors_on_shift,
      nurses_on_shift,
      oxygen_cylinders,
      ventilators,
      medicines,
      incoming_emergencies,
      aqi = 0,
      festival = '',
      news_summary = '',
    } = body;

    // Validate required fields
    if (!hospital_id || beds_total === undefined || beds_free === undefined ||
        doctors_on_shift === undefined || nurses_on_shift === undefined ||
        oxygen_cylinders === undefined || ventilators === undefined ||
        incoming_emergencies === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Check if hospital exists
    const hospital = await db.select()
      .from(hospitals)
      .where(eq(hospitals.hospitalId, hospital_id))
      .limit(1);

    if (hospital.length === 0) {
      return NextResponse.json(
        { error: 'Hospital not found', code: 'HOSPITAL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Step 1: Save snapshot to database
    const snapshotTimestamp = timestamp || new Date().toISOString();
    const newSnapshot = await db.insert(hospitalSnapshots)
      .values({
        hospitalId: hospital_id,
        timestamp: snapshotTimestamp,
        bedsTotal: beds_total,
        bedsFree: beds_free,
        doctorsOnShift: doctors_on_shift,
        nursesOnShift: nurses_on_shift,
        oxygenCylinders: oxygen_cylinders,
        ventilators: ventilators,
        medicines: medicines || null,
        incomingEmergencies: incoming_emergencies,
        aqi: aqi || null,
        festival: festival || null,
        newsSummary: news_summary || null,
      })
      .returning();

    if (!newSnapshot || newSnapshot.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create snapshot', code: 'SNAPSHOT_CREATE_FAILED' },
        { status: 500 }
      );
    }

    const snapshotId = newSnapshot[0].id;

    // Step 2: Run QuickCheck logic
    const capacity_ratio = (beds_free / Math.max(1, beds_total)) * 100;
    const predicted_need_estimate = Math.max(
      Math.ceil(beds_total * 0.10),
      Math.ceil(incoming_emergencies * 1.5)
    );

    let trigger_score = 0;
    if (aqi >= 200) trigger_score += 2;
    if (festival && festival.trim() !== '') trigger_score += 1;
    
    const newsLower = news_summary.toLowerCase();
    if (newsLower.includes('accident') || 
        newsLower.includes('mass casualty') || 
        newsLower.includes('collapse')) {
      trigger_score += 3;
    }
    if (incoming_emergencies >= 5) trigger_score += 1;

    let risk: 'Low' | 'Medium' | 'High';
    if (
      capacity_ratio < 10 ||
      oxygen_cylinders < Math.max(5, Math.floor(predicted_need_estimate / 2)) ||
      trigger_score >= 3
    ) {
      risk = 'High';
    } else if (
      capacity_ratio < 30 ||
      oxygen_cylinders < predicted_need_estimate
    ) {
      risk = 'Medium';
    } else {
      risk = 'Low';
    }

    // Step 3: Decide whether to escalate to AgenticAnalysis
    let analysisResult;
    
    if (risk === 'Low' && trigger_score < 3) {
      // Low risk - use quick check results only
      const quickRecommendedAction = 
        'Normal operations. Continue routine monitoring of capacity and resources.';
      
      analysisResult = {
        risk: 'Low',
        predicted_additional_patients_6h: predicted_need_estimate,
        recommended_actions: [{
          step: 1,
          type: 'advisory',
          detail: quickRecommendedAction,
          qty: null,
          urgency: 'low',
          eta_hours: null,
        }],
        alert_message: `Normal operations. Predicted ${predicted_need_estimate} patients. Capacity comfortable at ${Math.round(capacity_ratio)}%. Continue routine monitoring.`,
        confidence: 0.85,
        reasoning: `QuickCheck assessment: ${Math.round(capacity_ratio)}% capacity available, trigger score ${trigger_score}. Normal operations recommended.`,
        simulated_outcomes: JSON.stringify({ status: 'Low risk, no immediate action needed' }),
      };
    } else {
      // Medium or High risk - escalate to AgenticAnalysis
      try {
        const agenticResponse = await fetch(`${request.nextUrl.origin}/api/agentic_analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers.get('Authorization') || '',
          },
          body: JSON.stringify({
            hospital_id,
            beds_total,
            beds_free,
            doctors_on_shift,
            nurses_on_shift,
            oxygen_cylinders,
            ventilators,
            medicines,
            incoming_emergencies,
            aqi,
            festival,
            news_summary,
            quick_check_result: {
              risk,
              capacity_ratio,
              predicted_need_estimate,
              trigger_score,
            },
          }),
        });

        if (!agenticResponse.ok) {
          throw new Error('AgenticAnalysis call failed');
        }

        analysisResult = await agenticResponse.json();
      } catch (error) {
        console.error('AgenticAnalysis escalation failed, using fallback:', error);
        
        // Fallback to simple analysis if agentic call fails
        analysisResult = {
          risk,
          predicted_additional_patients_6h: predicted_need_estimate,
          recommended_actions: [{
            step: 1,
            type: 'advisory',
            detail: risk === 'High' 
              ? 'URGENT: Activate emergency protocols. Contact nearby hospitals for patient transfer.'
              : 'CAUTION: Monitor situation closely. Ensure staff are on standby.',
            qty: null,
            urgency: risk === 'High' ? 'high' : 'medium',
            eta_hours: 0.5,
          }],
          alert_message: risk === 'High'
            ? `URGENT: ${predicted_need_estimate} additional patients predicted. Capacity at ${Math.round(capacity_ratio)}%. Immediate action required.`
            : `CAUTION: ${predicted_need_estimate} patients expected. Capacity ${Math.round(capacity_ratio)}%. Monitor closely.`,
          confidence: 0.80,
          reasoning: `Risk escalated to ${risk}. Trigger score: ${trigger_score}, Capacity: ${Math.round(capacity_ratio)}%.`,
          simulated_outcomes: JSON.stringify({ status: 'Analysis pending full agentic review' }),
        };
      }
    }

    // Step 4: Store AI analysis result
    const newAnalysis = await db.insert(aiAnalyses)
      .values({
        snapshotId: snapshotId,
        risk: analysisResult.risk,
        predictedAdditionalPatients6h: analysisResult.predicted_additional_patients_6h,
        recommendedActions: JSON.stringify(analysisResult.recommended_actions),
        alertMessage: analysisResult.alert_message,
        confidenceScore: analysisResult.confidence || null,
        capacityRatio: capacity_ratio,
        reasoningSummary: analysisResult.reasoning || null,
        reasoning: analysisResult.reasoning || null,
        simulatedOutcomes: analysisResult.simulated_outcomes || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    if (!newAnalysis || newAnalysis.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create analysis', code: 'ANALYSIS_CREATE_FAILED' },
        { status: 500 }
      );
    }

    // Step 5: Return complete result
    return NextResponse.json(
      {
        success: true,
        snapshot_id: snapshotId,
        analysis_id: newAnalysis[0].id,
        hospital_id,
        timestamp: snapshotTimestamp,
        risk: analysisResult.risk,
        predicted_additional_patients_6h: analysisResult.predicted_additional_patients_6h,
        recommended_actions: analysisResult.recommended_actions,
        alert_message: analysisResult.alert_message,
        confidence: analysisResult.confidence,
        capacity_ratio: Math.round(capacity_ratio * 100) / 100,
        trigger_score,
        escalated_to_agentic: risk !== 'Low' || trigger_score >= 3,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}