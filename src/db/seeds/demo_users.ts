import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Check if admin user already exists
    const existingAdmin = await db.select().from(user).where(eq(user.email, 'admin@medcentric.ai'));
    
    // Check if staff user already exists
    const existingStaff = await db.select().from(user).where(eq(user.email, 'sarah@medcentric.ai'));

    const usersToInsert = [];
    const accountsToInsert = [];

    // Admin User
    if (existingAdmin.length === 0) {
        const adminUserId = randomUUID();
        
        usersToInsert.push({
            id: adminUserId,
            name: 'Admin User',
            email: 'admin@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'admin',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });

        accountsToInsert.push({
            id: randomUUID(),
            accountId: 'admin@medcentric.ai',
            providerId: 'credential',
            userId: adminUserId,
            password: bcrypt.hashSync('admin123', 10),
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });
    }

    // Staff User
    if (existingStaff.length === 0) {
        const staffUserId = randomUUID();
        
        usersToInsert.push({
            id: staffUserId,
            name: 'Dr. Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: true,
            image: null,
            role: 'staff',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });

        accountsToInsert.push({
            id: randomUUID(),
            accountId: 'sarah@medcentric.ai',
            providerId: 'credential',
            userId: staffUserId,
            password: bcrypt.hashSync('staff123', 10),
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });
    }

    // Insert users and accounts
    if (usersToInsert.length > 0) {
        await db.insert(user).values(usersToInsert);
        await db.insert(account).values(accountsToInsert);
        
        console.log('✅ Demo users seeder completed successfully');
        console.log('\n📋 Demo Credentials:');
        console.log('══════════════════════════════════════');
        
        if (existingAdmin.length === 0) {
            console.log('👤 Admin User:');
            console.log('   Email: admin@medcentric.ai');
            console.log('   Password: admin123');
            console.log('   Role: admin');
        }
        
        if (existingStaff.length === 0) {
            console.log('\n👤 Staff User:');
            console.log('   Email: sarah@medcentric.ai');
            console.log('   Password: staff123');
            console.log('   Role: staff');
        }
        
        console.log('══════════════════════════════════════\n');
    } else {
        console.log('ℹ️  Demo users already exist, skipping insertion');
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});