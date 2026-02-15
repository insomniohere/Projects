import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getArtworkById, updateArtwork, deleteArtwork, incrementViewCount } from '@/lib/api/artworks';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const artwork = await getArtworkById(id);

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Increment view count (get IP from headers)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    await incrementViewCount(id, ip);

    return NextResponse.json({ artwork });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Update artwork
    const updated = await updateArtwork(id, userId, body);

    return NextResponse.json({ artwork: updated });
  } catch (error) {
    console.error('Error updating artwork:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete (archive) artwork
    await deleteArtwork(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting artwork:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
