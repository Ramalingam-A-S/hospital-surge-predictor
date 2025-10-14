import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hospitalSnapshots, aiAnalyses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get and validate ID parameter
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid snapshot ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const snapshotId = parseInt(id);

    // Check if snapshot exists
    const existingSnapshot = await db
      .select()
      .from(hospitalSnapshots)
      .where(eq(hospitalSnapshots.id, snapshotId))
      .limit(1);

    if (existingSnapshot.length === 0) {
      return NextResponse.json(
        { error: 'Snapshot not found', code: 'SNAPSHOT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete associated AI analysis records first
    await db
      .delete(aiAnalyses)
      .where(eq(aiAnalyses.snapshotId, snapshotId));

    // Delete the snapshot record
    await db
      .delete(hospitalSnapshots)
      .where(eq(hospitalSnapshots.id, snapshotId));

    return NextResponse.json(
      {
        success: true,
        message: 'Snapshot and analysis deleted successfully',
        deleted_snapshot_id: snapshotId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE snapshot error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}