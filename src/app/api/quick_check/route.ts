import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Try reading JSON body, else use empty object
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    // Default/demo values
    const hospital_id = body.hospital_id || `HOSP-DEMO`;
    const beds_total = body.beds_total ?? 100;
    const beds_free = body.beds_free ?? 25;
    const oxygen_cylinders = body.oxygen_cylinders ?? 40;
    const incoming_emergencies = body.incoming_emergencies ?? 5;
    const aqi = body.aqi ?? 100;
    const festival = body.festival ?? 'None';
    const news_summary = body.news_summary ?? 'Routine day';

    // Ensure beds_free <= beds_total
    const safe_beds_free = Math.min(beds_free, beds_total);

    // Capacity ratio
    const capacity_ratio = (safe_beds_free / Math.max(1, beds_total)) * 100;

    // Predicted need estimate
    const predicted_need_estimate = Math.max(
      Math.ceil(beds_total * 0.1),
      Math.ceil(incoming_emergencies * 1.5)
    );

    // Trigger score
    let trigger_score = 0;
    if (aqi >= 200) trigger_score += 2;
    if (festival !== 'None') trigger_score += 1;
    const newsLower = news_summary.toLowerCase();
    if (newsLower.includes('accident') || newsLower.includes('mass casualty') || newsLower.includes('collapse')) {
      trigger_score += 3;
    }
    if (incoming_emergencies >= 5) trigger_score += 1;

    // Determine risk
    let risk: 'Low' | 'Medium' | 'High';
    let recommended_quick_action: string;

    if (capacity_ratio < 10 || oxygen_cylinders < Math.max(5, Math.floor(predicted_need_estimate / 2)) || trigger_score >= 3) {
      risk = 'High';
      recommended_quick_action = 'URGENT: Activate emergency protocols. Contact nearby hospitals for patient transfer.';
    } else if (capacity_ratio < 30 || oxygen_cylinders < predicted_need_estimate) {
      risk = 'Medium';
      recommended_quick_action = 'CAUTION: Monitor situation closely. Review supply inventory.';
    } else {
      risk = 'Low';
      recommended_quick_action = 'Normal operations. Continue routine monitoring.';
    }

    return NextResponse.json({
      hospital_id,
      beds_total,
      beds_free: safe_beds_free,
      oxygen_cylinders,
      incoming_emergencies,
      aqi,
      festival,
      news_summary,
      capacity_ratio: Math.round(capacity_ratio * 100) / 100,
      predicted_need_estimate,
      trigger_score,
      risk,
      recommended_quick_action
    });
  } catch (error) {
    console.error('QuickCheck demo error:', error);
    return NextResponse.json(
      { error: 'QuickCheck demo failed', code: 'DEMO_ERROR' },
      { status: 200 }
    );
  }
}
