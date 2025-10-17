import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

async function main() {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const demoUsers = [
        {
            id: randomUUID(),
            name: 'Admin User',
            email: 'admin@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'admin',
            createdAt: timestamp,
            updatedAt: timestamp,
            password: 'admin123'
        },
        {
            id: randomUUID(),
            name: 'Dr. Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'staff',
            createdAt: timestamp,
            updatedAt: timestamp,
            password: 'staff123'
        }
    ];

    const emails = demoUsers.map(u => u.email);
    const existingUsers = await db.select().from(user).where(inArray(user.email, emails));
    
    if (existingUsers.length > 0) {
        console.log('⚠️ Demo users already exist. Skipping seeding.');
        console.log('Existing users:', existingUsers.map(u => u.email).join(', '));
        return;
    }

    const usersToInsert = demoUsers.map(({ password, ...userData }) => userData);
    await db.insert(user).values(usersToInsert);

    const accountsToInsert = demoUsers.map(u => ({
        id: randomUUID(),
        accountId: u.email,
        providerId: 'credential',
        userId: u.id,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        password: bcrypt.hashSync(u.password, 10),
        createdAt: timestamp,
        updatedAt: timestamp,
    }));

    await db.insert(account).values(accountsToInsert);

    console.log('✅ Demo users seeder completed successfully\n');
    console.log('📧 Created Demo User Credentials:');
    console.log('─────────────────────────────────────');
    demoUsers.forEach(u => {
        console.log(`\nRole: ${u.role.toUpperCase()}`);
        console.log(`Name: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Password: ${u.password}`);
    });
    console.log('\n─────────────────────────────────────');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});