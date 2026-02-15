import { Suspense } from 'react';
import { getPublishedArtworks } from '@/lib/api/artworks';
import { db } from '@/lib/db';
import { users, artworks } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';
import ArtworkGrid from '@/components/artwork/ArtworkGrid';
import Link from 'next/link';
import { Loader2, TrendingUp, Users } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'painting', label: 'Painting' },
  { value: 'photography', label: 'Photography' },
  { value: '3d-art', label: '3D Art' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'random', label: 'Random' },
];

async function getFeaturedArtists() {
  try {
    const featuredArtists = await db
      .select({
        user: users,
        artworkCount: sql<number>`count(${artworks.id})::int`,
        totalViews: sql<number>`sum(${artworks.viewCount})::int`,
      })
      .from(users)
      .leftJoin(artworks, sql`${artworks.userId} = ${users.id} AND ${artworks.status} = 'published'`)
      .groupBy(users.id)
      .having(sql`count(${artworks.id}) > 0`)
      .orderBy(sql`sum(${artworks.viewCount}) DESC`)
      .limit(6);

    return featuredArtists;
  } catch (error) {
    console.error('Error fetching featured artists:', error);
    return [];
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const category = params.category && params.category !== 'all' ? params.category : undefined;
  const sortBy = (params.sort as 'newest' | 'most_viewed' | 'random') || 'newest';
  const tag = params.tag;

  // Fetch artworks
  const artworksData = await getPublishedArtworks({
    category,
    sortBy,
    limit: 12,
  });

  // Filter by tag if specified (client-side for simplicity)
  const filteredArtworks = tag
    ? artworksData.filter((item) => item.artwork.tags?.includes(tag))
    : artworksData;

  // Extract artworks with user info
  const artworksWithUsers = filteredArtworks.map((item) => ({
    ...item.artwork,
    artist: item.user,
  }));

  // Fetch featured artists
  const featuredArtists = await getFeaturedArtists();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05445E] via-[#0A4D68] to-[#088395]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Artworks
          </h1>
          <p className="text-xl text-white/70">
            Discover protected, human-made art from talented artists
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <select
                defaultValue={category || 'all'}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value === 'all') {
                    url.searchParams.delete('category');
                  } else {
                    url.searchParams.set('category', e.target.value);
                  }
                  window.location.href = url.toString();
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sort By
              </label>
              <select
                defaultValue={sortBy}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('sort', e.target.value);
                  window.location.href = url.toString();
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Tag */}
          {tag && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-white/70">Filtering by tag:</span>
              <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300">
                #{tag}
              </span>
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('tag');
                  window.location.href = url.toString();
                }}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Featured Artists */}
        {featuredArtists.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Featured Artists</h2>
              </div>
              <Link
                href="/artists"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredArtists.map((item) => (
                <Link
                  key={item.user.id}
                  href={`/artists/${item.user.username || item.user.id}`}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 hover:bg-white/15 transition-all text-center"
                >
                  <img
                    src={item.user.avatarUrl || '/placeholder-avatar.png'}
                    alt={item.user.displayName || item.user.username || 'Artist'}
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white/20"
                  />
                  <div className="font-semibold text-white text-sm truncate">
                    {item.user.displayName || item.user.username}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {item.artworkCount} artworks
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Artworks Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {category ? CATEGORIES.find(c => c.value === category)?.label : 'All Artworks'}
          </h2>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          }
        >
          {artworksWithUsers.length > 0 ? (
            <ArtworkGrid
              initialArtworks={artworksWithUsers}
              apiUrl={`/api/artworks?category=${category || ''}&sort=${sortBy}`}
            />
          ) : (
            <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <p className="text-white/70 text-lg">No artworks found</p>
              <p className="text-white/50 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </Suspense>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-white/20 p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Art?
          </h3>
          <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
            Join our community of artists and protect your work with AI-proof watermarking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
