import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Call Emergent AI API
    const emergentResponse = await fetch('https://surge-predict-1.preview.emergentagent.com/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!emergentResponse.ok) {
      throw new Error(`Emergent API error: ${emergentResponse.status} ${emergentResponse.statusText}`);
    }

    const emergentData = await emergentResponse.json();

    // Pass through the response from Emergent AI
    // Expected format: { risk, predicted_additional_patients_6h, recommended_actions, alert_message, confidence }
    const response = {
      success: true,
      hospital_id: data.hospital_id,
      timestamp: new Date().toISOString(),
      analysis: {
        risk: emergentData.risk || 'Low',
        predicted_additional_patients_next_6h: emergentData.predicted_additional_patients_6h || 0,
        recommended_actions: emergentData.recommended_actions || [],
        alert_message: emergentData.alert_message || 'Analysis completed',
        confidence_score: emergentData.confidence || emergentData.confidence_score,
        metrics: {
          occupancy_rate: data.beds_total > 0 ? Math.round(((data.beds_total - data.beds_free) / data.beds_total) * 100) : 0,
          staff_available: (data.doctors_on_shift || 0) + (data.nurses_on_shift || 0),
          critical_supplies_status: (data.oxygen_cylinders >= 30 && data.ventilators >= 10) ? 'adequate' : 'low'
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze hospital data. API may be unreachable.',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}