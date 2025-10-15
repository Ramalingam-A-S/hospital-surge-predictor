import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitals, liveResources } from '@/db/schema';
import { eq, ne } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { hospital_id, required_beds, specialty = 'ward' } = await request.json();

    if (!hospital_id || !required_beds) {
      return NextResponse.json(
        { error: 'hospital_id and required_beds are required' },
        { status: 400 }
      );
    }

    // Fetch all hospitals except the requesting one
    const networkHospitals = await db
      .select()
      .from(hospitals)
      .where(ne(hospitals.hospital_id, hospital_id));

    // Fetch live resources for each hospital
    const resourcesData = await db
      .select()
      .from(liveResources);

    // Build recommendations
    const recommendations = [];

    for (const hospital of networkHospitals) {
      const resources = resourcesData.find(r => r.hospital_id === hospital.hospital_id);
      
      if (resources && resources.beds_free >= required_beds) {
        const capacity_ratio = (resources.beds_free / Math.max(1, resources.beds_total)) * 100;
        
        // Estimate ETA based on distance (simplified)
        const eta = hospital.hospital_id.includes('CENTRAL') ? 15 : 
                    hospital.hospital_id.includes('HOSP-B') ? 25 : 30;

        recommendations.push({
          hospital_id: hospital.hospital_id,
          hospital_name: hospital.name,
          available_beds: resources.beds_free,
          capacity_ratio: Math.round(capacity_ratio),
          oxygen_available: resources.oxygen_cylinders,
          ventilators_available: resources.ventilators,
          specialty_available: specialty === 'ICU' ? resources.ventilators > 0 : true,
          distance_km: hospital.hospital_id.includes('CENTRAL') ? 10 : 
                       hospital.hospital_id.includes('HOSP-B') ? 18 : 25,
          eta_minutes: eta,
          contact: hospital.contact || 'N/A',
          recommended: capacity_ratio > 20
        });
      }
    }

    // Sort by capacity ratio (descending) and ETA (ascending)
    recommendations.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return b.capacity_ratio - a.capacity_ratio || a.eta_minutes - b.eta_minutes;
    });

    return NextResponse.json({
      success: true,
      requesting_hospital: hospital_id,
      required_beds,
      specialty,
      available_options: recommendations.length,
      recommendations: recommendations.slice(0, 5), // Top 5 options
      urgent_message: recommendations.length === 0 
        ? 'No immediate transfer options available. Consider regional emergency coordination.'
        : `${recommendations.length} transfer option(s) identified in network.`
    });

  } catch (error) {
    console.error('TransferAdvisor error:', error);
    return NextResponse.json(
      { error: 'Failed to identify transfer options' },
      { status: 500 }
    );
  }
}