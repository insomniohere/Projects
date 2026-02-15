import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createArtwork, getUserArtworks, getPublishedArtworks } from '@/lib/api/artworks';
import { uploadOriginal, uploadWatermarked, generateThumbnailUrl } from '@/lib/cloudinary/upload';
import { applyWatermark, createPublicVersion } from '@/lib/watermark/apply';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tagsStr = formData.get('tags') as string;
    const protectionLevel = formData.get('protectionLevel') as 'basic' | 'standard' | 'enhanced';
    const licenseType = formData.get('licenseType') as string;
    const status = formData.get('status') as 'draft' | 'published';

    // Validate required fields
    if (!file || !title || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Apply watermark
    const { watermarkedBuffer, watermarkId } = await applyWatermark(buffer, {
      protectionLevel,
      text: 'Protected by Abyss',
    });

    // Create public version (reduced quality)
    const publicBuffer = await createPublicVersion(watermarkedBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `artwork_${userId}_${timestamp}`;

    // Upload to Cloudinary
    const [originalUpload, watermarkedUpload] = await Promise.all([
      uploadOriginal(buffer, `${filename}_original`),
      uploadWatermarked(publicBuffer, `${filename}_watermarked`),
    ]);

    // Generate thumbnail URL
    const thumbnailUrl = generateThumbnailUrl(watermarkedUpload.publicId);

    // Parse tags
    const tags = tagsStr ? JSON.parse(tagsStr) : [];

    // Create artwork record
    const artwork = await createArtwork({
      userId,
      title,
      description: description || '',
      category,
      tags,
      originalUrl: originalUpload.secureUrl,
      watermarkedUrl: watermarkedUpload.secureUrl,
      thumbnailUrl,
      watermarkId,
      protectionLevel,
      licenseType,
      status,
    });

    return NextResponse.json({
      success: true,
      artwork,
      message: 'Artwork uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading artwork:', error);
    return NextResponse.json(
      { error: 'Failed to upload artwork' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const myArtworks = searchParams.get('myArtworks') === 'true';
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') as 'newest' | 'most_viewed' | 'random' | undefined;
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    let artworks;

    if (myArtworks && userId) {
      // Get user's own artworks
      artworks = await getUserArtworks(userId, { limit, offset });
    } else {
      // Get published artworks
      artworks = await getPublishedArtworks({
        category: category || undefined,
        limit,
        offset,
        sortBy,
      });
    }

    return NextResponse.json({ artworks });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}
