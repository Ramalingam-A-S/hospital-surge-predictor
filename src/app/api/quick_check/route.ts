import { NextRequest, NextResponse } from 'next/server';

interface QuickCheckResult {
  risk: 'Low' | 'Medium' | 'High';
  capacity_ratio: number;
  predicted_need_estimate: number;
  trigger_score: number;
  recommended_quick_action: string;
  hospital_id: string;
  beds_total: number;
  beds_free: number;
  oxygen_cylinders: number;
  incoming_emergencies: number;
  aqi: number;
  festival: string;
  news_summary: string;
}

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export async function POST(request: NextRequest) {
  try {
    // Generate random hospital scenario
    const hospital_id = `HOSP-${randomInt(100, 999)}`;
    const beds_total = randomInt(50, 200);
    const beds_free = randomInt(0, beds_total);
    const oxygen_cylinders = randomInt(5, 100);
    const incoming_emergencies = randomInt(0, 10);
    const aqi = randomInt(50, 300);
    const festival = randomChoice(['None', 'Diwali', 'Christmas', 'Eid', 'Holi']);
    const news_summary = randomChoice([
      'Routine day',
      'Minor accident nearby',
      'Mass casualty reported',
      'Bridge collapse',
      'Community health camp ongoing'
    ]);

    // Calculate capacity_ratio
    const capacity_ratio = (beds_free / Math.max(1, beds_total)) * 100;

    // Calculate predicted_need_estimate
    const predicted_need_estimate = Math.max(
      Math.ceil(beds_total * 0.10),
      Math.ceil(incoming_emergencies * 1.5)
    );

    // Calculate trigger_score
    let trigger_score = 0;
    if (aqi >= 200) trigger_score += 2;
    if (festival && festival !== 'None') trigger_score += 1;

    const newsLower = news_summary.toLowerCase();
    if (newsLower.includes('accident') || newsLower.includes('mass casualty') || newsLower.includes('collapse')) {
      trigger_score += 3;
    }
    if (incoming_emergencies >= 5) trigger_score += 1;

    // Determine risk level
    let risk: 'Low' | 'Medium' | 'High';
    let recommended_quick_action: string;

    if (
      capacity_ratio < 10 ||
      oxygen_cylinders < Math.max(5, Math.floor(predicted_need_estimate / 2)) ||
      trigger_score >= 3
    ) {
      risk = 'High';
      recommended_quick_action =
        'URGENT: Activate emergency protocols. Contact nearby hospitals for patient transfer. ' +
        'Request additional staff and supplies immediately. Prepare for potential surge.';
    } else if (
      capacity_ratio < 30 ||
      oxygen_cylinders < predicted_need_estimate
    ) {
      risk = 'Medium';
      recommended_quick_action =
        'CAUTION: Monitor situation closely. Ensure staff are on standby. ' +
        'Review supply inventory and prepare contingency plans.';
    } else {
      risk = 'Low';
      recommended_quick_action =
        'Normal operations. Continue routine monitoring of capacity and resources.';
    }

    const result: QuickCheckResult = {
      risk,
      capacity_ratio: Math.round(capacity_ratio * 100) / 100,
      predicted_need_estimate,
      trigger_score,
      recommended_quick_action,
      hospital_id,
      beds_total,
      beds_free,
      oxygen_cylinders,
      incoming_emergencies,
      aqi,
      festival,
      news_summary
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('QuickCheck demo error:', error);
    return NextResponse.json(
      {
        error: 'Demo mode active — AI analysis unavailable',
        code: 'DEMO_MODE',
      },
      { status: 200 }
    );
  }
}
