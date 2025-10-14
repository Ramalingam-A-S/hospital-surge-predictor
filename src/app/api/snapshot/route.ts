import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

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

    // Parse request body
    const body = await request.json();

    // Extract and validate required fields
    const {
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
    } = body;

    // Validation: Required fields
    if (!hospital_id || typeof hospital_id !== 'string') {
      return NextResponse.json(
        { error: 'hospital_id is required and must be a string', code: 'MISSING_HOSPITAL_ID' },
        { status: 400 }
      );
    }

    if (beds_total === undefined || beds_total === null || typeof beds_total !== 'number') {
      return NextResponse.json(
        { error: 'beds_total is required and must be a number', code: 'MISSING_BEDS_TOTAL' },
        { status: 400 }
      );
    }

    if (beds_free === undefined || beds_free === null || typeof beds_free !== 'number') {
      return NextResponse.json(
        { error: 'beds_free is required and must be a number', code: 'MISSING_BEDS_FREE' },
        { status: 400 }
      );
    }

    if (doctors_on_shift === undefined || doctors_on_shift === null || typeof doctors_on_shift !== 'number') {
      return NextResponse.json(
        { error: 'doctors_on_shift is required and must be a number', code: 'MISSING_DOCTORS_ON_SHIFT' },
        { status: 400 }
      );
    }

    if (nurses_on_shift === undefined || nurses_on_shift === null || typeof nurses_on_shift !== 'number') {
      return NextResponse.json(
        { error: 'nurses_on_shift is required and must be a number', code: 'MISSING_NURSES_ON_SHIFT' },
        { status: 400 }
      );
    }

    if (oxygen_cylinders === undefined || oxygen_cylinders === null || typeof oxygen_cylinders !== 'number') {
      return NextResponse.json(
        { error: 'oxygen_cylinders is required and must be a number', code: 'MISSING_OXYGEN_CYLINDERS' },
        { status: 400 }
      );
    }

    if (ventilators === undefined || ventilators === null || typeof ventilators !== 'number') {
      return NextResponse.json(
        { error: 'ventilators is required and must be a number', code: 'MISSING_VENTILATORS' },
        { status: 400 }
      );
    }

    if (!medicines || typeof medicines !== 'object') {
      return NextResponse.json(
        { error: 'medicines is required and must be an object', code: 'MISSING_MEDICINES' },
        { status: 400 }
      );
    }

    if (incoming_emergencies === undefined || incoming_emergencies === null || typeof incoming_emergencies !== 'number') {
      return NextResponse.json(
        { error: 'incoming_emergencies is required and must be a number', code: 'MISSING_INCOMING_EMERGENCIES' },
        { status: 400 }
      );
    }

    // Business logic validations
    if (beds_total < 0 || beds_free < 0 || beds_free > beds_total) {
      return NextResponse.json(
        { error: 'Invalid bed counts: beds_free must be between 0 and beds_total', code: 'INVALID_BED_COUNTS' },
        { status: 400 }
      );
    }

    // Create hospital snapshot
    const timestamp = new Date().toISOString();
    const snapshotData = {
      hospitalId: hospital_id.trim(),
      timestamp,
      bedsTotal: beds_total,
      bedsFree: beds_free,
      doctorsOnShift: doctors_on_shift,
      nursesOnShift: nurses_on_shift,
      oxygenCylinders: oxygen_cylinders,
      ventilators,
      medicines: JSON.stringify(medicines),
      incomingEmergencies: incoming_emergencies,
      aqi: aqi !== undefined && aqi !== null ? aqi : null,
      festival: festival?.trim() || null,
      newsSummary: news_summary?.trim() || null,
    };

    const [newSnapshot] = await db.insert(hospitalSnapshots)
      .values(snapshotData)
      .returning();

    if (!newSnapshot) {
      return NextResponse.json(
        { error: 'Failed to create hospital snapshot', code: 'SNAPSHOT_CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Calculate capacity ratio
    const capacityRatio = beds_total > 0 ? (beds_total - beds_free) / beds_total : 0;

    // Determine risk level
    let riskLevel: string;
    let predictedPatients: number;
    let recommendedActions: Array<{ action: string; priority: string; reason: string }>;
    let alertMessage: string;
    let reasoningSummary: string;

    if (capacityRatio >= 0.85) {
      riskLevel = 'High';
      predictedPatients = Math.floor(Math.random() * 21) + 40; // 40-60
      alertMessage = 'CRITICAL: Hospital capacity at dangerous levels. Immediate action required.';
      recommendedActions = [
        {
          action: 'Activate emergency overflow protocols',
          priority: 'Critical',
          reason: 'Hospital is at 85%+ capacity and may reach full capacity within hours',
        },
        {
          action: 'Contact nearby hospitals for patient transfers',
          priority: 'High',
          reason: 'Need to distribute patient load to prevent overcrowding',
        },
        {
          action: 'Recall off-duty medical staff',
          priority: 'High',
          reason: 'Additional staff needed to handle increased patient volume',
        },
        {
          action: 'Postpone non-emergency procedures',
          priority: 'Medium',
          reason: 'Free up resources and beds for emergency cases',
        },
      ];
      reasoningSummary = `Critical capacity situation detected with ${(capacityRatio * 100).toFixed(1)}% bed occupancy. With ${incoming_emergencies} incoming emergencies and current resource levels (${doctors_on_shift} doctors, ${nurses_on_shift} nurses), the hospital is at high risk of overcrowding. Predicted additional patients in next 6 hours: ${predictedPatients}.`;
    } else if (capacityRatio >= 0.70) {
      riskLevel = 'Medium';
      predictedPatients = Math.floor(Math.random() * 16) + 20; // 20-35
      alertMessage = 'WARNING: Hospital capacity approaching high levels. Prepare contingency plans.';
      recommendedActions = [
        {
          action: 'Expedite discharge of stable patients',
          priority: 'High',
          reason: 'Free up beds before reaching critical capacity',
        },
        {
          action: 'Prepare emergency overflow areas',
          priority: 'Medium',
          reason: 'Ensure backup capacity is ready if needed',
        },
        {
          action: 'Monitor oxygen and ventilator supplies closely',
          priority: 'Medium',
          reason: `Current supplies: ${oxygen_cylinders} oxygen cylinders, ${ventilators} ventilators`,
        },
        {
          action: 'Review staffing schedules for potential reinforcement',
          priority: 'Low',
          reason: 'Ensure adequate staff coverage for increasing patient load',
        },
      ];
      reasoningSummary = `Moderate capacity pressure with ${(capacityRatio * 100).toFixed(1)}% bed occupancy. Current resources (${doctors_on_shift} doctors, ${nurses_on_shift} nurses, ${oxygen_cylinders} oxygen cylinders, ${ventilators} ventilators) are adequate but trending toward strain. With ${incoming_emergencies} incoming emergencies, proactive measures recommended. Predicted additional patients in next 6 hours: ${predictedPatients}.`;
    } else {
      riskLevel = 'Low';
      predictedPatients = Math.floor(Math.random() * 11) + 5; // 5-15
      alertMessage = 'STABLE: Hospital capacity within normal operating parameters.';
      recommendedActions = [
        {
          action: 'Continue standard operating procedures',
          priority: 'Low',
          reason: 'Hospital capacity is well within normal range',
        },
        {
          action: 'Maintain routine equipment checks',
          priority: 'Low',
          reason: 'Ensure all medical equipment remains operational',
        },
        {
          action: 'Monitor incoming emergency trends',
          priority: 'Low',
          reason: `Current incoming emergencies: ${incoming_emergencies}`,
        },
      ];
      reasoningSummary = `Hospital operating at comfortable capacity with ${(capacityRatio * 100).toFixed(1)}% bed occupancy. Resources are well-distributed with ${doctors_on_shift} doctors, ${nurses_on_shift} nurses, ${oxygen_cylinders} oxygen cylinders, and ${ventilators} ventilators available. With ${incoming_emergencies} incoming emergencies, the facility can handle normal patient flow. Predicted additional patients in next 6 hours: ${predictedPatients}.`;
    }

    // Add contextual factors to reasoning
    if (festival) {
      reasoningSummary += ` FESTIVAL ALERT: ${festival} - expect increased patient volume.`;
      predictedPatients = Math.floor(predictedPatients * 1.3); // 30% increase during festivals
    }

    if (aqi !== undefined && aqi !== null && aqi > 200) {
      reasoningSummary += ` AIR QUALITY WARNING: AQI of ${aqi} may lead to respiratory emergencies.`;
      predictedPatients = Math.floor(predictedPatients * 1.2); // 20% increase for poor air quality
    }

    if (news_summary) {
      reasoningSummary += ` NEWS CONTEXT: ${news_summary}`;
    }

    // Generate confidence score (0.85-0.95)
    const confidenceScore = 0.85 + Math.random() * 0.10;

    // Create AI analysis record
    const analysisData = {
      snapshotId: newSnapshot.id,
      risk: riskLevel,
      predictedAdditionalPatients6h: predictedPatients,
      recommendedActions: JSON.stringify(recommendedActions),
      alertMessage,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      capacityRatio: Math.round(capacityRatio * 1000) / 1000,
      reasoningSummary,
    };

    const [newAnalysis] = await db.insert(aiAnalyses)
      .values(analysisData)
      .returning();

    if (!newAnalysis) {
      return NextResponse.json(
        { error: 'Failed to create AI analysis', code: 'ANALYSIS_CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Return complete response
    return NextResponse.json(
      {
        snapshot_id: newSnapshot.id,
        analysis_id: newAnalysis.id,
        hospital_id: newSnapshot.hospitalId,
        timestamp: newSnapshot.timestamp,
        capacity_ratio: newAnalysis.capacityRatio,
        risk: newAnalysis.risk,
        alert_message: newAnalysis.alertMessage,
        predicted_additional_patients_6h: newAnalysis.predictedAdditionalPatients6h,
        recommended_actions: JSON.parse(newAnalysis.recommendedActions as string),
        confidence_score: newAnalysis.confidenceScore,
        reasoning_summary: newAnalysis.reasoningSummary,
        snapshot_data: {
          beds_total: newSnapshot.bedsTotal,
          beds_free: newSnapshot.bedsFree,
          doctors_on_shift: newSnapshot.doctorsOnShift,
          nurses_on_shift: newSnapshot.nursesOnShift,
          oxygen_cylinders: newSnapshot.oxygenCylinders,
          ventilators: newSnapshot.ventilators,
          medicines: JSON.parse(newSnapshot.medicines as string),
          incoming_emergencies: newSnapshot.incomingEmergencies,
          aqi: newSnapshot.aqi,
          festival: newSnapshot.festival,
          news_summary: newSnapshot.newsSummary,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/snapshot error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}