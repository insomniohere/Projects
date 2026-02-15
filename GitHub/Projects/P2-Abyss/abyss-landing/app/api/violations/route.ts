import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { violationReports, artworks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { artworkId, violationType, violationUrl, description } = body;

    // Validate required fields
    if (!artworkId || !violationType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify artwork ownership
    const [artwork] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, artworkId))
      .limit(1);

    if (!artwork || artwork.userId !== userId) {
      return NextResponse.json(
        { error: 'Artwork not found or unauthorized' },
        { status: 404 }
      );
    }

    // Validate description length
    if (description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Create violation report
    const [report] = await db
      .insert(violationReports)
      .values({
        artworkId,
        reportedBy: userId,
        violationType,
        violationUrl: violationUrl || null,
        description,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      report,
      message: 'Violation report submitted successfully',
    });
  } catch (error) {
    console.error('Error creating violation report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user's violation reports
    let query = db
      .select({
        report: violationReports,
        artwork: artworks,
      })
      .from(violationReports)
      .leftJoin(artworks, eq(violationReports.artworkId, artworks.id))
      .where(eq(violationReports.reportedBy, userId))
      .orderBy(desc(violationReports.createdAt))
      .limit(limit);

    if (status) {
      query = query.where(eq(violationReports.status, status));
    }

    const reports = await query;

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching violation reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
