import { db } from '@/db';
import { liveResources } from '@/db/schema';

async function main() {
    const sampleLiveResources = [
        {
            hospitalId: 'MED-CENTRAL-001',
            bedsTotal: 100,
            bedsFree: 60,
            oxygenCylinders: 40,
            ventilators: 10,
            lastUpdated: new Date().toISOString(),
        },
        {
            hospitalId: 'HOSP-B',
            bedsTotal: 120,
            bedsFree: 80,
            oxygenCylinders: 50,
            ventilators: 12,
            lastUpdated: new Date().toISOString(),
        },
        {
            hospitalId: 'HOSP-C',
            bedsTotal: 80,
            bedsFree: 20,
            oxygenCylinders: 15,
            ventilators: 6,
            lastUpdated: new Date().toISOString(),
        }
    ];

    await db.insert(liveResources).values(sampleLiveResources);
    
    console.log('✅ Live resources seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});