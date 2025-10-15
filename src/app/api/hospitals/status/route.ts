import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { liveResources } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Retrieve all live resources ordered by hospitalId
    const resources = await db.select()
      .from(liveResources)
      .orderBy(asc(liveResources.hospitalId));

    // Transform to match the required response format
    const formattedResources = resources.map(resource => ({
      id: resource.id,
      hospital_id: resource.hospitalId,
      beds_total: resource.bedsTotal,
      beds_free: resource.bedsFree,
      oxygen_cylinders: resource.oxygenCylinders,
      ventilators: resource.ventilators,
      last_updated: resource.lastUpdated
    }));

    return NextResponse.json(formattedResources, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}