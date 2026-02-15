import { db } from '@/lib/db';
import { users, artworks, follows } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface UserWithStats {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
  verifiedArtist: boolean;
  createdAt: Date;
  stats: {
    artworkCount: number;
    totalViews: number;
    followerCount: number;
    followingCount: number;
  };
}

export async function getUserById(userId: string): Promise<UserWithStats | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return null;
    }

    // Get artwork count and total views
    const [artworkStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalViews: sql<number>`coalesce(sum(${artworks.viewCount}), 0)::int`,
      })
      .from(artworks)
      .where(eq(artworks.userId, userId));

    // Get follower count
    const [followerStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(follows)
      .where(eq(follows.followingId, userId));

    // Get following count
    const [followingStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return {
      ...user,
      stats: {
        artworkCount: artworkStats?.count || 0,
        totalViews: artworkStats?.totalViews || 0,
        followerCount: followerStats?.count || 0,
        followingCount: followingStats?.count || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<UserWithStats | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return null;
    }

    return getUserById(user.id);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    websiteUrl?: string;
    avatarUrl?: string;
  }
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getUserArtworks(userId: string, limit = 12) {
  try {
    const userArtworks = await db
      .select()
      .from(artworks)
      .where(eq(artworks.userId, userId))
      .orderBy(desc(artworks.createdAt))
      .limit(limit);

    return userArtworks;
  } catch (error) {
    console.error('Error fetching user artworks:', error);
    return [];
  }
}

export async function getPublicUserArtworks(userId: string, limit = 12) {
  try {
    const userArtworks = await db
      .select()
      .from(artworks)
      .where(eq(artworks.userId, userId))
      .where(eq(artworks.status, 'published'))
      .orderBy(desc(artworks.publishedAt))
      .limit(limit);

    return userArtworks;
  } catch (error) {
    console.error('Error fetching public artworks:', error);
    return [];
  }
}
