import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

interface AgenticAnalysisInput {
  hospital_id: string;
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
  quick_check_result?: any;
}

interface RecommendedAction {
  step: number;
  type: 'staff' | 'supply' | 'transfer' | 'advisory';
  detail: string;
  qty: number | null;
  urgency: 'low' | 'medium' | 'high';
  eta_hours: number | null;
}

interface AgenticAnalysisResult {
  risk: 'Low' | 'Medium' | 'High';
  predicted_additional_patients_6h: number;
  recommended_actions: RecommendedAction[];
  alert_message: string;
  confidence: number;
  reasoning: string;
  simulated_outcomes: string;
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

    const body: AgenticAnalysisInput = await request.json();
    const {
      hospital_id,
      beds_total,
      beds_free,
      doctors_on_shift,
      nurses_on_shift,
      oxygen_cylinders,
      ventilators,
      incoming_emergencies,
      aqi = 0,
      festival = '',
      news_summary = '',
    } = body;

    // Validation
    if (!hospital_id || beds_total === undefined || beds_free === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Fetch recent history for this hospital (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentHistory = await db
      .select()
      .from(hospitalSnapshots)
      .where(eq(hospitalSnapshots.hospitalId, hospital_id))
      .orderBy(desc(hospitalSnapshots.timestamp))
      .limit(10);

    // Check for USE_AGENTIC environment variable
    const useAgentic = process.env.USE_AGENTIC === 'true';

    let result: AgenticAnalysisResult;

    if (useAgentic) {
      // Try to call external LLM (placeholder for actual implementation)
      try {
        result = await callExternalLLM(body, recentHistory);
      } catch (error) {
        console.log('LLM call failed, using fallback logic:', error);
        result = fallbackAnalysis(body);
      }
    } else {
      // Use fallback logic
      result = fallbackAnalysis(body);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('AgenticAnalysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

// Fallback analysis using rule-based logic
function fallbackAnalysis(input: AgenticAnalysisInput): AgenticAnalysisResult {
  const {
    beds_total,
    beds_free,
    doctors_on_shift,
    nurses_on_shift,
    oxygen_cylinders,
    ventilators,
    incoming_emergencies,
    aqi = 0,
    festival = '',
    news_summary = '',
  } = input;

  // Calculate capacity_ratio
  const capacity_ratio = (beds_free / Math.max(1, beds_total)) * 100;

  // Calculate trigger_score (same as QuickCheck)
  let trigger_score = 0;
  if (aqi >= 200) trigger_score += 2;
  if (festival && festival.trim() !== '') trigger_score += 1;
  
  const newsLower = news_summary.toLowerCase();
  const hasMassCasualty = newsLower.includes('accident') || 
                          newsLower.includes('mass casualty') || 
                          newsLower.includes('collapse') ||
                          newsLower.includes('disaster');
  if (hasMassCasualty) trigger_score += 3;
  if (incoming_emergencies >= 5) trigger_score += 1;

  // Estimate predicted_additional_patients_6h with trigger factor
  const baseline = Math.ceil(beds_total * 0.10);
  let trigger_factor = 1.0;
  if (trigger_score === 1) trigger_factor = 1.5;
  else if (trigger_score === 2) trigger_factor = 2.0;
  else if (trigger_score >= 3) trigger_factor = 2.8;

  const predicted_additional_patients_6h = Math.ceil(baseline * trigger_factor);

  // Determine risk level (conservative)
  let risk: 'Low' | 'Medium' | 'High';
  if (
    capacity_ratio < 10 ||
    oxygen_cylinders < Math.max(5, Math.floor(predicted_additional_patients_6h / 2)) ||
    trigger_score >= 3 ||
    hasMassCasualty
  ) {
    risk = 'High';
  } else if (
    capacity_ratio < 30 ||
    oxygen_cylinders < predicted_additional_patients_6h ||
    trigger_score >= 2
  ) {
    risk = 'Medium';
  } else {
    risk = 'Low';
  }

  // Generate recommended actions
  const recommended_actions: RecommendedAction[] = [];
  let stepCounter = 1;

  if (risk === 'High') {
    if (hasMassCasualty) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'advisory',
        detail: 'Activate Mass Casualty Incident (MCI) protocols immediately',
        qty: null,
        urgency: 'high',
        eta_hours: 0.25,
      });
    }

    if (capacity_ratio < 15) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'transfer',
        detail: 'Initiate patient transfer to nearby hospitals',
        qty: Math.ceil((15 - capacity_ratio) / 100 * beds_total),
        urgency: 'high',
        eta_hours: 1.0,
      });
    }

    if (oxygen_cylinders < predicted_additional_patients_6h / 2) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'supply',
        detail: 'Emergency oxygen cylinder delivery',
        qty: Math.ceil(predicted_additional_patients_6h / 2 - oxygen_cylinders),
        urgency: 'high',
        eta_hours: 2.0,
      });
    }

    const totalStaff = doctors_on_shift + nurses_on_shift;
    const requiredStaff = Math.ceil(beds_total * 0.15);
    if (totalStaff < requiredStaff) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'staff',
        detail: 'Recall off-duty staff and request emergency staffing support',
        qty: requiredStaff - totalStaff,
        urgency: 'high',
        eta_hours: 1.5,
      });
    }

    if (ventilators < 5) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'supply',
        detail: 'Request ventilator equipment from regional medical center',
        qty: Math.max(5 - ventilators, 3),
        urgency: 'high',
        eta_hours: 3.0,
      });
    }

    recommended_actions.push({
      step: stepCounter++,
      type: 'advisory',
      detail: 'Notify hospital administration and regional health authority',
      qty: null,
      urgency: 'high',
      eta_hours: 0.5,
    });

  } else if (risk === 'Medium') {
    if (capacity_ratio < 30) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'advisory',
        detail: 'Place staff on standby and prepare emergency response plans',
        qty: null,
        urgency: 'medium',
        eta_hours: 0.5,
      });
    }

    if (oxygen_cylinders < predicted_additional_patients_6h) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'supply',
        detail: 'Schedule oxygen cylinder replenishment',
        qty: predicted_additional_patients_6h - oxygen_cylinders + 5,
        urgency: 'medium',
        eta_hours: 4.0,
      });
    }

    const totalStaff = doctors_on_shift + nurses_on_shift;
    if (totalStaff < beds_total * 0.10) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'staff',
        detail: 'Schedule additional nursing shifts for coverage',
        qty: Math.ceil(beds_total * 0.10 - totalStaff),
        urgency: 'medium',
        eta_hours: 6.0,
      });
    }

    recommended_actions.push({
      step: stepCounter++,
      type: 'advisory',
      detail: 'Review and update emergency contact list and supply inventory',
      qty: null,
      urgency: 'medium',
      eta_hours: 1.0,
    });

  } else {
    recommended_actions.push({
      step: stepCounter++,
      type: 'advisory',
      detail: 'Continue routine capacity monitoring and maintain current operations',
      qty: null,
      urgency: 'low',
      eta_hours: null,
    });

    if (oxygen_cylinders < beds_total * 0.20) {
      recommended_actions.push({
        step: stepCounter++,
        type: 'supply',
        detail: 'Schedule routine oxygen inventory replenishment',
        qty: Math.ceil(beds_total * 0.25 - oxygen_cylinders),
        urgency: 'low',
        eta_hours: 24.0,
      });
    }
  }

  // Generate simulated outcomes for top 3 actions
  const top3Actions = recommended_actions.slice(0, 3);
  const simulatedOutcomes = {
    action_1: top3Actions[0] ? {
      action: top3Actions[0].detail,
      estimated_beds_freed: top3Actions[0].type === 'transfer' ? top3Actions[0].qty || 0 : 0,
      estimated_oxygen_increase: top3Actions[0].type === 'supply' && top3Actions[0].detail.includes('oxygen') ? top3Actions[0].qty || 0 : 0,
      impact: risk === 'High' ? 'Critical for surge capacity' : 'Moderate improvement',
    } : null,
    action_2: top3Actions[1] ? {
      action: top3Actions[1].detail,
      estimated_beds_freed: top3Actions[1].type === 'transfer' ? top3Actions[1].qty || 0 : 0,
      estimated_oxygen_increase: top3Actions[1].type === 'supply' && top3Actions[1].detail.includes('oxygen') ? top3Actions[1].qty || 0 : 0,
      impact: risk === 'High' ? 'Significant resource boost' : 'Stabilizes capacity',
    } : null,
    action_3: top3Actions[2] ? {
      action: top3Actions[2].detail,
      estimated_beds_freed: 0,
      estimated_oxygen_increase: top3Actions[2].type === 'supply' && top3Actions[2].detail.includes('oxygen') ? top3Actions[2].qty || 0 : 0,
      impact: risk === 'High' ? 'Supports emergency response' : 'Maintains readiness',
    } : null,
  };

  // Generate alert message (<=35 words)
  let alert_message = '';
  if (risk === 'High') {
    alert_message = `URGENT: ${predicted_additional_patients_6h} additional patients predicted. Capacity at ${Math.round(capacity_ratio)}%. Immediate action required: activate emergency protocols and coordinate transfers.`;
  } else if (risk === 'Medium') {
    alert_message = `CAUTION: ${predicted_additional_patients_6h} patients expected. Capacity ${Math.round(capacity_ratio)}%. Monitor closely and ensure staff standby readiness.`;
  } else {
    alert_message = `Normal operations. Predicted ${predicted_additional_patients_6h} patients. Capacity comfortable at ${Math.round(capacity_ratio)}%. Continue routine monitoring.`;
  }

  // Generate reasoning
  const reasoning = `Analysis based on ${beds_total} total beds with ${beds_free} available (${Math.round(capacity_ratio)}% free). ` +
    `Trigger score: ${trigger_score} (AQI: ${aqi}, Festival: ${festival ? 'Yes' : 'No'}, News: ${hasMassCasualty ? 'Critical incident' : 'Normal'}). ` +
    `Staff: ${doctors_on_shift} doctors, ${nurses_on_shift} nurses. Resources: ${oxygen_cylinders} O2, ${ventilators} vents. ` +
    `Risk determined as ${risk} due to ${capacity_ratio < 15 ? 'critical capacity' : capacity_ratio < 30 ? 'limited capacity' : 'sufficient capacity'} ` +
    `and ${trigger_score >= 3 ? 'high' : trigger_score >= 2 ? 'moderate' : 'low'} external risk factors.`;

  // Calculate confidence
  let confidence = 0.85;
  if (risk === 'High' && trigger_score >= 3) confidence = 0.92;
  else if (risk === 'Medium') confidence = 0.80;
  else if (risk === 'Low') confidence = 0.88;

  return {
    risk,
    predicted_additional_patients_6h,
    recommended_actions,
    alert_message,
    confidence,
    reasoning,
    simulated_outcomes: JSON.stringify(simulatedOutcomes),
  };
}

// Placeholder for external LLM call
async function callExternalLLM(
  input: AgenticAnalysisInput,
  recentHistory: any[]
): Promise<AgenticAnalysisResult> {
  // This would call an external AI service like OpenAI, Anthropic, etc.
  // For now, throw an error to trigger fallback
  throw new Error('External LLM not configured');
}