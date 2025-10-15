import { db } from '@/db';
import { hospitalSnapshots } from '@/db/schema';

async function main() {
    const sampleSnapshots = [
        {
            hospitalId: 'MED-CENTRAL-001',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            bedsTotal: 100,
            bedsFree: 60,
            doctorsOnShift: 8,
            nursesOnShift: 15,
            oxygenCylinders: 40,
            ventilators: 10,
            medicines: { paracetamol: 500, antibiotics: 200 },
            incomingEmergencies: 1,
            aqi: 80,
            festival: null,
            newsSummary: null,
        },
        {
            hospitalId: 'HOSP-B',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            bedsTotal: 120,
            bedsFree: 50,
            doctorsOnShift: 10,
            nursesOnShift: 18,
            oxygenCylinders: 30,
            ventilators: 12,
            medicines: { paracetamol: 400, antibiotics: 150 },
            incomingEmergencies: 3,
            aqi: 120,
            festival: null,
            newsSummary: null,
        },
        {
            hospitalId: 'MED-CENTRAL-001',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            bedsTotal: 100,
            bedsFree: 25,
            doctorsOnShift: 6,
            nursesOnShift: 12,
            oxygenCylinders: 15,
            ventilators: 8,
            medicines: { paracetamol: 200, antibiotics: 100 },
            incomingEmergencies: 5,
            aqi: 180,
            festival: 'Regional fair',
            newsSummary: 'Large crowds expected for festival',
        },
        {
            hospitalId: 'HOSP-C',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            bedsTotal: 80,
            bedsFree: 5,
            doctorsOnShift: 5,
            nursesOnShift: 8,
            oxygenCylinders: 8,
            ventilators: 4,
            medicines: { paracetamol: 100, antibiotics: 50 },
            incomingEmergencies: 8,
            aqi: 220,
            festival: null,
            newsSummary: 'Traffic congestion reported in multiple areas',
        },
        {
            hospitalId: 'MED-CENTRAL-001',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            bedsTotal: 100,
            bedsFree: 15,
            doctorsOnShift: 6,
            nursesOnShift: 10,
            oxygenCylinders: 12,
            ventilators: 6,
            medicines: { paracetamol: 150, antibiotics: 80 },
            incomingEmergencies: 12,
            aqi: 250,
            festival: 'Diwali',
            newsSummary: 'Multiple injuries reported in highway accident involving several vehicles',
        },
    ];

    await db.insert(hospitalSnapshots).values(sampleSnapshots);
    
    console.log('✅ Hospital snapshots seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});