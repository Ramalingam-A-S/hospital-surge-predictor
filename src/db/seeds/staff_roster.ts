import { db } from '@/db';
import { staffRoster } from '@/db/schema';

async function main() {
    const sampleStaff = [
        {
            staffId: 'STAFF-001',
            name: 'Dr. Emily Carter',
            role: 'Doctor',
            hospitalId: 'MED-CENTRAL-001',
            onShift: true,
            phone: '+1-555-0101',
        },
        {
            staffId: 'STAFF-002',
            name: 'Nurse James Wilson',
            role: 'Nurse',
            hospitalId: 'MED-CENTRAL-001',
            onShift: true,
            phone: '+1-555-0102',
        },
        {
            staffId: 'STAFF-003',
            name: 'Dr. Maria Rodriguez',
            role: 'Doctor',
            hospitalId: 'HOSP-B',
            onShift: false,
            phone: '+1-555-0103',
        },
        {
            staffId: 'STAFF-004',
            name: 'Nurse David Lee',
            role: 'Nurse',
            hospitalId: 'HOSP-B',
            onShift: true,
            phone: '+1-555-0104',
        },
        {
            staffId: 'STAFF-005',
            name: 'Sarah Mitchell',
            role: 'Admin',
            hospitalId: 'HOSP-C',
            onShift: true,
            phone: '+1-555-0105',
        },
    ];

    await db.insert(staffRoster).values(sampleStaff);
    
    console.log('✅ Staff roster seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});