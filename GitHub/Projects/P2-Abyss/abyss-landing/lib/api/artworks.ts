import { db } from '@/lib/db';
import { artworks, users, protectionLogs } from '@/lib/db/schema';
import { eq, desc, and, sql, or, ilike } from 'drizzle-orm';

export interface CreateArtworkData {
  userId: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  originalUrl: string;
  watermarkedUrl: string;
  thumbnailUrl: string;
  watermarkId: string;
  protectionLevel: 'basic' | 'standard' | 'enhanced';
  licenseType: string;
  status: 'draft' | 'published';
}

export async function createArtwork(data: CreateArtworkData) {
  try {
    const [artwork] = await db
      .insert(artworks)
      .values({
        ...data,
        publishedAt: data.status === 'published' ? new Date() : null,
      })
      .returning();

    // Log protection event
    await db.insert(protectionLogs).values({
      artworkId: artwork.id,
      eventType: 'watermark_applied',
      details: {
        protectionLevel: data.protectionLevel,
        watermarkId: data.watermarkId,
      },
    });

    return artwork;
  } catch (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }
}

export async function getArtworkById(artworkId: string) {
  try {
    const [artwork] = await db
      .select({
        artwork: artworks,
        user: users,
      })
      .from(artworks)
      .leftJoin(users, eq(artworks.userId, users.id))
      .where(eq(artworks.id, artworkId))
      .limit(1);

    return artwork || null;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return null;
  }
}

export async function getUserArtworks(
  userId: string,
  options: {
    status?: 'draft' | 'published' | 'archived';
    limit?: number;
    offset?: number;
  } = {}
) {
  const { status, limit = 12, offset = 0 } = options;

  try {
    let query = db
      .select()
      .from(artworks)
      .where(eq(artworks.userId, userId))
      .orderBy(desc(artworks.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where(eq(artworks.status, status));
    }

    const results = await query;
    return results;
  } catch (error) {
    console.error('Error fetching user artworks:', error);
    return [];
  }
}

export async function getPublishedArtworks(options: {
  category?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'most_viewed' | 'random';
} = {}) {
  const { category, limit = 12, offset = 0, sortBy = 'newest' } = options;

  try {
    let query = db
      .select({
        artwork: artworks,
        user: users,
      })
      .from(artworks)
      .leftJoin(users, eq(artworks.userId, users.id))
      .where(eq(artworks.status, 'published'));

    if (category) {
      query = query.where(eq(artworks.category, category));
    }

    // Apply sorting
    switch (sortBy) {
      case 'most_viewed':
        query = query.orderBy(desc(artworks.viewCount));
        break;
      case 'random':
        query = query.orderBy(sql`RANDOM()`);
        break;
      case 'newest':
      default:
        query = query.orderBy(desc(artworks.publishedAt));
        break;
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  } catch (error) {
    console.error('Error fetching published artworks:', error);
    return [];
  }
}

export async function searchArtworks(query: string, limit = 12) {
  try {
    const searchResults = await db
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
      .orderBy(desc(artworks.publishedAt))
      .limit(limit);

    return searchResults;
  } catch (error) {
    console.error('Error searching artworks:', error);
    return [];
  }
}

export async function updateArtwork(
  artworkId: string,
  userId: string,
  data: Partial<CreateArtworkData>
) {
  try {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, artworkId))
      .limit(1);

    if (!existing || existing.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Update artwork
    const [updated] = await db
      .update(artworks)
      .set({
        ...data,
        updatedAt: new Date(),
        publishedAt: data.status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt,
      })
      .where(eq(artworks.id, artworkId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Error updating artwork:', error);
    throw error;
  }
}

export async function deleteArtwork(artworkId: string, userId: string) {
  try {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, artworkId))
      .limit(1);

    if (!existing || existing.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Soft delete (archive)
    await db
      .update(artworks)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(artworks.id, artworkId));

    return true;
  } catch (error) {
    console.error('Error deleting artwork:', error);
    throw error;
  }
}

export async function incrementViewCount(artworkId: string, ipAddress?: string) {
  try {
    // Increment view count
    await db
      .update(artworks)
      .set({
        viewCount: sql`${artworks.viewCount} + 1`,
      })
      .where(eq(artworks.id, artworkId));

    // Log view event
    await db.insert(protectionLogs).values({
      artworkId,
      eventType: 'view',
      details: { timestamp: new Date().toISOString() },
      ipAddress,
    });

    return true;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
}
