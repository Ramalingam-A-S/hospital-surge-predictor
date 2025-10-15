import { db } from '@/db';
import { hospitals } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const hospitalsData = [
        {
            hospitalId: 'MED-CENTRAL-001',
            name: 'Central Medical Center',
            location: 'Downtown District',
            capacityTotal: 100,
            capacityCurrent: 40,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            hospitalId: 'HOSP-B',
            name: 'Regional Health Hospital',
            location: 'North District',
            capacityTotal: 120,
            capacityCurrent: 40,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            hospitalId: 'HOSP-C',
            name: 'Community General Hospital',
            location: 'South District',
            capacityTotal: 80,
            capacityCurrent: 60,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const hospital of hospitalsData) {
        const existingHospital = await db
            .select()
            .from(hospitals)
            .where(eq(hospitals.hospitalId, hospital.hospitalId))
            .limit(1);

        if (existingHospital.length > 0) {
            console.log(`⏭️  Skipped: Hospital "${hospital.name}" (${hospital.hospitalId}) already exists`);
            skippedCount++;
        } else {
            await db.insert(hospitals).values(hospital);
            console.log(`✅ Inserted: Hospital "${hospital.name}" (${hospital.hospitalId})`);
            insertedCount++;
        }
    }

    console.log(`\n✅ Hospitals seeder completed successfully`);
    console.log(`📊 Summary: ${insertedCount} inserted, ${skippedCount} skipped`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});