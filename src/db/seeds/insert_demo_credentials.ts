import { db } from '@/db';
import { user, account } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function main() {
    const SALT_ROUNDS = 10;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Hash passwords with bcrypt
    const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const staffPasswordHash = await bcrypt.hash('staff123', SALT_ROUNDS);

    const demoUsers = [
        {
            id: 'admin-demo-uuid-001',
            name: 'Admin User',
            email: 'admin@medcentric.ai',
            emailVerified: 1,
            image: null,
            role: 'admin',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 'staff-demo-uuid-001',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@medcentric.ai',
            emailVerified: 1,
            image: null,
            role: 'staff',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    const demoAccounts = [
        {
            id: 'account-admin-demo-001',
            accountId: 'admin@medcentric.ai',
            providerId: 'credential',
            userId: 'admin-demo-uuid-001',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: adminPasswordHash,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 'account-staff-demo-001',
            accountId: 'sarah@medcentric.ai',
            providerId: 'credential',
            userId: 'staff-demo-uuid-001',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: staffPasswordHash,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    try {
        // Insert users
        await db.insert(user).values(demoUsers);
        console.log('✅ Demo users inserted successfully');

        // Insert accounts with hashed passwords
        await db.insert(account).values(demoAccounts);
        console.log('✅ Demo accounts inserted successfully');

        // Verify insertion by selecting the created users
        const insertedUsers = await db.select().from(user).where(
            eq(user.email, 'admin@medcentric.ai')
        ).union(
            db.select().from(user).where(eq(user.email, 'sarah@medcentric.ai'))
        );

        console.log('\n📋 Created Users:');
        insertedUsers.forEach(u => {
            console.log(`- ${u.name} (${u.email}) - Role: ${u.role} - Email Verified: ${u.emailVerified}`);
        });

        console.log('\n✅ Demo credentials seeder completed successfully');
        console.log('\n🔑 Login Credentials:');
        console.log('Admin: admin@medcentric.ai / admin123');
        console.log('Staff: sarah@medcentric.ai / staff123');
        
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE constraint failed')) {
            console.log('⚠️  Users already exist, skipping insertion');
            
            // Still display existing users
            const existingUsers = await db.select().from(user);
            console.log('\n📋 Existing Users:');
            existingUsers.forEach(u => {
                console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
            });
        } else {
            throw error;
        }
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});