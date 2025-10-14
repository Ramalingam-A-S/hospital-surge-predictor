import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function main() {
    const adminId = randomUUID();
    const sarahId = randomUUID();
    const michaelId = randomUUID();

    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
    const hashedStaffPassword = bcrypt.hashSync('staff123', 10);

    const sampleUsers = [
        {
            id: adminId,
            name: 'Admin User',
            email: 'admin@medcentric.ai',
            emailVerified: 1,
            image: null,
            role: 'admin',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: sarahId,
            name: 'Dr. Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: 1,
            image: null,
            role: 'staff',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: michaelId,
            name: 'Nurse Michael Chen',
            email: 'michael@medcentric.ai',
            emailVerified: 1,
            image: null,
            role: 'staff',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
    ];

    await db.insert(user).values(sampleUsers);

    const sampleAccounts = [
        {
            id: randomUUID(),
            accountId: 'admin@medcentric.ai',
            providerId: 'credential',
            userId: adminId,
            password: hashedAdminPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: randomUUID(),
            accountId: 'sarah@medcentric.ai',
            providerId: 'credential',
            userId: sarahId,
            password: hashedStaffPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: randomUUID(),
            accountId: 'michael@medcentric.ai',
            providerId: 'credential',
            userId: michaelId,
            password: hashedStaffPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
    ];

    await db.insert(account).values(sampleAccounts);

    console.log('✅ User and account seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});