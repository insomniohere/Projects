import { Suspense } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, User, Image as ImageIcon } from 'lucide-react';
import { db } from '@/lib/db';
import { artworks, users } from '@/lib/db/schema';
import { sql, or, ilike, eq, and } from 'drizzle-orm';
import { formatNumber } from '@/lib/utils';

async function searchAll(query: string) {
  if (!query || query.length < 2) {
    return { artworks: [], artists: [] };
  }

  try {
    // Search artworks
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
      .limit(24);

    // Search artists
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
      .limit(12);

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
          ...user,
          artworkCount: countResult?.count || 0,
        };
      })
    );

    return {
      artworks: artworkResults,
      artists: artistsWithCounts,
    };
  } catch (error) {
    console.error('Search error:', error);
    return { artworks: [], artists: [] };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const results = await searchAll(query);

  const totalResults = results.artworks.length + results.artists.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05445E] via-[#0A4D68] to-[#088395]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-white/70 mb-2">
            <SearchIcon className="w-5 h-5" />
            <span>Search Results</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          {query && (
            <p className="text-white/70 mt-2">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {!query ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
            <SearchIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-lg">
              Enter a search term to find artworks and artists
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
            <p className="text-white/70 text-lg">No results found for "{query}"</p>
            <p className="text-white/50 mt-2">Try different keywords or browse the explore page</p>
            <Link
              href="/explore"
              className="inline-block mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Explore Artworks
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Artists */}
            {results.artists.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <User className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Artists ({results.artists.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.artists.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.username || artist.id}`}
                      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={artist.avatarUrl || '/placeholder-avatar.png'}
                          alt={artist.displayName || artist.username || 'Artist'}
                          className="w-16 h-16 rounded-full border-2 border-white/20"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">
                            {artist.displayName || artist.username}
                          </div>
                          <div className="text-sm text-white/70 truncate">
                            @{artist.username}
                          </div>
                          <div className="text-sm text-white/50 mt-1">
                            {artist.artworkCount} artworks
                          </div>
                        </div>
                      </div>
                      {artist.bio && (
                        <p className="text-sm text-white/70 mt-3 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Artworks */}
            {results.artworks.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <ImageIcon className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Artworks ({results.artworks.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.artworks.map((item) => (
                    <Link
                      key={item.artwork.id}
                      href={`/artists/${item.user?.username || 'unknown'}/${item.artwork.id}`}
                      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all group"
                    >
                      <div className="aspect-square bg-white/5 relative overflow-hidden">
                        <img
                          src={item.artwork.thumbnailUrl}
                          alt={item.artwork.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white font-semibold">
                            {formatNumber(item.artwork.viewCount || 0)} views
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white truncate">
                          {item.artwork.title}
                        </h3>
                        <p className="text-sm text-white/70 mt-1">
                          by {item.user?.displayName || item.user?.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
