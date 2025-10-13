import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snapshots, predictions, hospitals } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hospital_id, snapshot_data, prediction_data } = body;

    // Validate required fields
    if (!hospital_id) {
      return NextResponse.json(
        { 
          error: 'hospital_id is required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    if (!snapshot_data) {
      return NextResponse.json(
        { 
          error: 'snapshot_data is required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    if (!prediction_data) {
      return NextResponse.json(
        { 
          error: 'prediction_data is required',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Validate required snapshot_data fields
    const requiredSnapshotFields = [
      'timestamp',
      'beds_total',
      'beds_free',
      'doctors_on_shift',
      'nurses_on_shift',
      'oxygen_cylinders',
      'ventilators',
      'medicines',
      'incoming_emergencies'
    ];

    for (const field of requiredSnapshotFields) {
      if (snapshot_data[field] === undefined || snapshot_data[field] === null) {
        return NextResponse.json(
          { 
            error: `snapshot_data.${field} is required`,
            code: 'MISSING_REQUIRED_FIELDS' 
          },
          { status: 400 }
        );
      }
    }

    // Validate required prediction_data fields
    const requiredPredictionFields = [
      'risk_level',
      'predicted_additional_patients_6h',
      'recommended_actions',
      'alert_message'
    ];

    for (const field of requiredPredictionFields) {
      if (prediction_data[field] === undefined || prediction_data[field] === null) {
        return NextResponse.json(
          { 
            error: `prediction_data.${field} is required`,
            code: 'MISSING_REQUIRED_FIELDS' 
          },
          { status: 400 }
        );
      }
    }

    // Check if hospital exists
    const hospital = await db.select()
      .from(hospitals)
      .where(eq(hospitals.hospitalId, hospital_id))
      .limit(1);

    if (hospital.length === 0) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    // Insert snapshot record
    const newSnapshot = await db.insert(snapshots)
      .values({
        hospitalId: hospital_id,
        timestamp: snapshot_data.timestamp,
        bedsTotal: snapshot_data.beds_total,
        bedsFree: snapshot_data.beds_free,
        doctorsOnShift: snapshot_data.doctors_on_shift,
        nursesOnShift: snapshot_data.nurses_on_shift,
        oxygenCylinders: snapshot_data.oxygen_cylinders,
        ventilators: snapshot_data.ventilators,
        medicines: snapshot_data.medicines,
        incomingEmergencies: snapshot_data.incoming_emergencies,
        incidentDescription: snapshot_data.incident_description || null,
        aqi: snapshot_data.aqi || null,
        festival: snapshot_data.festival || null,
        newsSummary: snapshot_data.news_summary || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    if (!newSnapshot || newSnapshot.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create snapshot' },
        { status: 500 }
      );
    }

    const snapshotId = newSnapshot[0].id;

    // Insert prediction record
    const newPrediction = await db.insert(predictions)
      .values({
        snapshotId: snapshotId,
        riskLevel: prediction_data.risk_level,
        predictedAdditionalPatients6h: prediction_data.predicted_additional_patients_6h,
        recommendedActions: prediction_data.recommended_actions,
        alertMessage: prediction_data.alert_message,
        confidenceScore: prediction_data.confidence_score || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    if (!newPrediction || newPrediction.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create prediction' },
        { status: 500 }
      );
    }

    const predictionId = newPrediction[0].id;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        snapshot_id: snapshotId,
        prediction_id: predictionId
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