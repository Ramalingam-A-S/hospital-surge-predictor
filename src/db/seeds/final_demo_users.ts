import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    try {
        const now = Math.floor(Date.now() / 1000);
        
        const adminUserId = 'admin-uuid-final';
        const staffUserId = 'staff-uuid-final';
        
        const sampleUsers = [
            {
                id: adminUserId,
                name: 'Admin User',
                email: 'admin@medcentric.ai',
                emailVerified: true,
                role: 'admin',
                createdAt: new Date(now * 1000),
                updatedAt: new Date(now * 1000),
            },
            {
                id: staffUserId,
                name: 'Dr. Sarah Johnson',
                email: 'sarah@medcentric.ai',
                emailVerified: true,
                role: 'staff',
                createdAt: new Date(now * 1000),
                updatedAt: new Date(now * 1000),
            }
        ];
        
        await db.insert(user).values(sampleUsers);
        
        const adminPasswordHash = bcrypt.hashSync('admin123', 10);
        const staffPasswordHash = bcrypt.hashSync('staff123', 10);
        
        const sampleAccounts = [
            {
                id: `account-${adminUserId}`,
                accountId: adminUserId,
                providerId: 'credential',
                userId: adminUserId,
                password: adminPasswordHash,
                createdAt: new Date(now * 1000),
                updatedAt: new Date(now * 1000),
            },
            {
                id: `account-${staffUserId}`,
                accountId: staffUserId,
                providerId: 'credential',
                userId: staffUserId,
                password: staffPasswordHash,
                createdAt: new Date(now * 1000),
                updatedAt: new Date(now * 1000),
            }
        ];
        
        await db.insert(account).values(sampleAccounts);
        
        console.log('✅ Demo users seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('==================');
        console.log('Admin User:');
        console.log('  Email: admin@medcentric.ai');
        console.log('  Password: admin123');
        console.log('\nStaff User:');
        console.log('  Email: sarah@medcentric.ai');
        console.log('  Password: staff123');
        console.log('==================\n');
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE constraint failed')) {
            console.log('ℹ️ Users already exist in the database');
        } else {
            throw error;
        }
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});