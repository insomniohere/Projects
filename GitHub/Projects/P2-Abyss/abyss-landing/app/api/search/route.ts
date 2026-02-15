import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { artworks, users } from '@/lib/db/schema';
import { sql, or, ilike, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'all', 'artworks', 'artists'
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results: {
      artworks?: any[];
      artists?: any[];
    } = {};

    // Search artworks
    if (type === 'all' || type === 'artworks') {
      const artworkResults = await db
        .select({
          artwork: artworks,
          user: users,
        })
        .from(artworks)
        .leftJoin(users, eq(artworks.userId, users.id))
        .where(
          and(
            eq(artworks.status, 'published'),
            or(
              ilike(artworks.title, `%${query}%`),
              ilike(artworks.description, `%${query}%`),
              sql`${artworks.tags}::text ILIKE ${'%' + query + '%'}`
            )
          )
        )
        .limit(limit);

      results.artworks = artworkResults.map((item) => ({
        id: item.artwork.id,
        type: 'artwork',
        title: item.artwork.title,
        description: item.artwork.description,
        thumbnailUrl: item.artwork.thumbnailUrl,
        artist: {
          id: item.user?.id,
          username: item.user?.username,
          displayName: item.user?.displayName,
          avatarUrl: item.user?.avatarUrl,
        },
        viewCount: item.artwork.viewCount,
        category: item.artwork.category,
      }));
    }

    // Search artists
    if (type === 'all' || type === 'artists') {
      const artistResults = await db
        .select()
        .from(users)
        .where(
          or(
            ilike(users.displayName, `%${query}%`),
            ilike(users.username, `%${query}%`),
            ilike(users.bio, `%${query}%`)
          )
        )
        .limit(limit);

      // Get artwork count for each artist
      const artistsWithCounts = await Promise.all(
        artistResults.map(async (user) => {
          const [countResult] = await db
            .select({
              count: sql<number>`count(*)::int`,
            })
            .from(artworks)
            .where(
              and(
                eq(artworks.userId, user.id),
                eq(artworks.status, 'published')
              )
            );

          return {
            id: user.id,
            type: 'artist',
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            artworkCount: countResult?.count || 0,
          };
        })
      );

      results.artists = artistsWithCounts;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
