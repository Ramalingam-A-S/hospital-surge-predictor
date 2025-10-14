import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitals, hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Query all hospitals ordered by name
    const allHospitals = await db.select()
      .from(hospitals)
      .orderBy(hospitals.name);

    // Build comparison data for each hospital
    const comparisonData = await Promise.all(
      allHospitals.map(async (hospital) => {
        try {
          // Get the most recent snapshot for this hospital
          const latestSnapshot = await db.select()
            .from(hospitalSnapshots)
            .where(eq(hospitalSnapshots.hospitalId, hospital.hospitalId))
            .orderBy(desc(hospitalSnapshots.timestamp))
            .limit(1);

          // If no snapshot exists, return hospital data with null snapshot and prediction
          if (latestSnapshot.length === 0) {
            return {
              hospital_id: hospital.hospitalId,
              hospital_name: hospital.name,
              location: hospital.location,
              capacity_total: hospital.capacityTotal,
              latest_snapshot: null,
              latest_prediction: null
            };
          }

          const snapshot = latestSnapshot[0];

          // Calculate occupancy rate and staff total
          const occupancyRate = snapshot.bedsTotal > 0
            ? parseFloat((((snapshot.bedsTotal - snapshot.bedsFree) / snapshot.bedsTotal) * 100).toFixed(1))
            : 0;
          const staffTotal = snapshot.doctorsOnShift + snapshot.nursesOnShift;

          // Get prediction for this snapshot
          const snapshotPrediction = await db.select()
            .from(aiAnalyses)
            .where(eq(aiAnalyses.snapshotId, snapshot.id))
            .limit(1);

          // Build latest_snapshot object
          const latestSnapshotData = {
            timestamp: snapshot.timestamp,
            beds_total: snapshot.bedsTotal,
            beds_free: snapshot.bedsFree,
            occupancy_rate: occupancyRate,
            staff_total: staffTotal,
            doctors_on_shift: snapshot.doctorsOnShift,
            nurses_on_shift: snapshot.nursesOnShift,
            oxygen_cylinders: snapshot.oxygenCylinders,
            ventilators: snapshot.ventilators,
            incoming_emergencies: snapshot.incomingEmergencies,
            aqi: snapshot.aqi
          };

          // Build latest_prediction object if prediction exists
          const latestPredictionData = snapshotPrediction.length > 0
            ? {
                risk_level: snapshotPrediction[0].risk,
                predicted_additional_patients_6h: snapshotPrediction[0].predictedAdditionalPatients6h,
                confidence_score: snapshotPrediction[0].confidenceScore,
                alert_message: snapshotPrediction[0].alertMessage
              }
            : null;

          return {
            hospital_id: hospital.hospitalId,
            hospital_name: hospital.name,
            location: hospital.location,
            capacity_total: hospital.capacityTotal,
            latest_snapshot: latestSnapshotData,
            latest_prediction: latestPredictionData
          };
        } catch (error) {
          console.error(`Error processing hospital ${hospital.hospitalId}:`, error);
          // Return hospital data with null snapshot/prediction if processing fails
          return {
            hospital_id: hospital.hospitalId,
            hospital_name: hospital.name,
            location: hospital.location,
            capacity_total: hospital.capacityTotal,
            latest_snapshot: null,
            latest_prediction: null
          };
        }
      })
    );

    return NextResponse.json({
      comparison_data: comparisonData,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'DATABASE_ERROR'
    }, { status: 500 });
  }
}