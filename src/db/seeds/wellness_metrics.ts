import { db } from '@/db';
import { wellnessMetrics } from '@/db/schema';

async function main() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const sampleWellnessMetrics = [
        {
            userId: 'user-123',
            timestamp: twoDaysAgo.toISOString(),
            moodScore: 7,
            note: 'Feeling good after a restful weekend',
        },
        {
            userId: 'user-123',
            timestamp: new Date().toISOString(),
            moodScore: 8,
            note: 'Great shift today, team worked well together',
        }
    ];

    await db.insert(wellnessMetrics).values(sampleWellnessMetrics);
    
    console.log('✅ Wellness metrics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});