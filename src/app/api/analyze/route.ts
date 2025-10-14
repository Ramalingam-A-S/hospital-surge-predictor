import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    // Save snapshot and prediction to database
    const snapshotData = {
      timestamp: new Date().toISOString(),
      beds_total: data.beds_total,
      beds_free: data.beds_free,
      doctors_on_shift: data.doctors_on_shift,
      nurses_on_shift: data.nurses_on_shift,
      oxygen_cylinders: data.oxygen_cylinders,
      ventilators: data.ventilators,
      medicines: data.key_meds,
      incoming_emergencies: data.incoming_emergencies,
      incident_description: data.incident_description || null,
      aqi: data.aqi || null,
      festival: data.festival_name || null,
      news_summary: data.major_news_summary || null,
    };

    const predictionData = {
      risk_level: emergentData.risk || 'Low',
      predicted_additional_patients_6h: emergentData.predicted_additional_patients_6h || 0,
      recommended_actions: emergentData.recommended_actions || [],
      alert_message: emergentData.alert_message || 'Analysis completed',
      confidence_score: emergentData.confidence || emergentData.confidence_score || null,
    };

    // Save to database via save-snapshot API
    try {
      const saveResponse = await fetch(`${request.nextUrl.origin}/api/save-snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_id: data.hospital_id,
          snapshot_data: snapshotData,
          prediction_data: predictionData,
        }),
      });

      if (!saveResponse.ok) {
        console.error('Failed to save to database:', await saveResponse.text());
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if database save fails
    }

    // Pass through the response from Emergent AI
    const response = {
      success: true,
      hospital_id: data.hospital_id,
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_name: user.name,
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
    
    // Log failed attempt locally
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('FAILED_ANALYSIS_ATTEMPT:', JSON.stringify(errorLog));
    
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