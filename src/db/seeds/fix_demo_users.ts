import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const SALT_ROUNDS = 10;

async function main() {
    const adminUserId = randomUUID();
    const staffUserId = randomUUID();

    const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const staffPasswordHash = await bcrypt.hash('staff123', SALT_ROUNDS);

    const sampleUsers = [
        {
            id: adminUserId,
            name: 'Admin User',
            email: 'admin@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: staffUserId,
            name: 'Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'staff',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const sampleAccounts = [
        {
            id: randomUUID(),
            accountId: 'admin@medcentric.ai',
            providerId: 'credential',
            userId: adminUserId,
            password: adminPasswordHash,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: randomUUID(),
            accountId: 'sarah@medcentric.ai',
            providerId: 'credential',
            userId: staffUserId,
            password: staffPasswordHash,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    await db.insert(user).values(sampleUsers);
    await db.insert(account).values(sampleAccounts);

    console.log('✅ Demo users seeder completed successfully');
    console.log('\n📋 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin User:');
    console.log('  Email: admin@medcentric.ai');
    console.log('  Password: admin123');
    console.log('  Role: admin');
    console.log('');
    console.log('Staff User:');
    console.log('  Email: sarah@medcentric.ai');
    console.log('  Password: staff123');
    console.log('  Role: staff');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});