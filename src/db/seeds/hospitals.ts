import { db } from '@/db';
import { hospitals } from '@/db/schema';

async function main() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const createdAtTimestamp = thirtyDaysAgo.toISOString();
    const updatedAtTimestamp = new Date().toISOString();

    const sampleHospitals = [
        {
            hospitalId: 'MED-CENTRAL-001',
            name: 'City General Hospital',
            location: 'Downtown Metro Area',
            capacityTotal: 500,
            capacityCurrent: 380,
            createdAt: createdAtTimestamp,
            updatedAt: updatedAtTimestamp,
        },
        {
            hospitalId: 'MED-CENTRAL-002',
            name: "St. Mary's Medical Center",
            location: 'Suburban District',
            capacityTotal: 300,
            capacityCurrent: 245,
            createdAt: createdAtTimestamp,
            updatedAt: updatedAtTimestamp,
        },
        {
            hospitalId: 'MED-CENTRAL-003',
            name: 'Regional Trauma Center',
            location: 'Metro Central',
            capacityTotal: 400,
            capacityCurrent: 320,
            createdAt: createdAtTimestamp,
            updatedAt: updatedAtTimestamp,
        },
        {
            hospitalId: 'MED-CENTRAL-004',
            name: 'Community Hospital',
            location: 'Rural Area',
            capacityTotal: 200,
            capacityCurrent: 150,
            createdAt: createdAtTimestamp,
            updatedAt: updatedAtTimestamp,
        },
        {
            hospitalId: 'MED-CENTRAL-005',
            name: 'University Medical Center',
            location: 'University District',
            capacityTotal: 600,
            capacityCurrent: 480,
            createdAt: createdAtTimestamp,
            updatedAt: updatedAtTimestamp,
        },
    ];

    await db.insert(hospitals).values(sampleHospitals);
    
    console.log('✅ Hospitals seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});