import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function main() {
    const adminUserId = randomUUID();
    const staffUserId = randomUUID();

    const adminPassword = bcrypt.hashSync('admin123456', 10);
    const staffPassword = bcrypt.hashSync('staff123456', 10);

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
            name: 'Dr. Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'staff',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    await db.insert(user).values(sampleUsers);

    const sampleAccounts = [
        {
            id: randomUUID(),
            accountId: 'admin@medcentric.ai',
            providerId: 'credential',
            userId: adminUserId,
            password: adminPassword,
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
            password: staffPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    await db.insert(account).values(sampleAccounts);

    console.log('✅ Auth users seeder completed successfully');
    console.log('\n📋 Login Credentials:');
    console.log('Admin User:');
    console.log('  Email: admin@medcentric.ai');
    console.log('  Password: admin123456');
    console.log('\nStaff User:');
    console.log('  Email: sarah@medcentric.ai');
    console.log('  Password: staff123456');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});