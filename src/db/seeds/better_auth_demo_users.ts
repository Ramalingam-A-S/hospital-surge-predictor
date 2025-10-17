import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function main() {
    // Generate UUIDs for both users
    const adminUserId = randomUUID();
    const staffUserId = randomUUID();

    // Hash passwords with 10 salt rounds
    const adminPasswordHash = await bcrypt.hash('admin123456', 10);
    const staffPasswordHash = await bcrypt.hash('staff123456', 10);

    const currentTimestamp = new Date();

    // Sample users data
    const sampleUsers = [
        {
            id: adminUserId,
            name: 'Admin User',
            email: 'admin@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'admin',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: staffUserId,
            name: 'Dr. Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'staff',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
    ];

    // Sample accounts data for better-auth
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
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
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
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
    ];

    // Insert users first
    await db.insert(user).values(sampleUsers);

    // Then insert accounts
    await db.insert(account).values(sampleAccounts);

    console.log('✅ Better-auth demo users seeded successfully\n');
    console.log('📋 Demo Login Credentials:');
    console.log('==========================================');
    console.log('Admin User:');
    console.log('  Email: admin@medcentric.ai');
    console.log('  Password: admin123456');
    console.log('  Role: admin\n');
    console.log('Staff User:');
    console.log('  Email: sarah@medcentric.ai');
    console.log('  Password: staff123456');
    console.log('  Role: staff');
    console.log('==========================================');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});