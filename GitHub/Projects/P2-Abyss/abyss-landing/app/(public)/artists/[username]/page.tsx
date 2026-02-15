import { notFound } from 'next/navigation';
import { MapPin, Link as LinkIcon, Calendar, Users } from 'lucide-react';
import { getUserByUsername, getPublicUserArtworks } from '@/lib/api/users';
import { formatDate, formatNumber } from '@/lib/utils';

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const artist = await getUserByUsername(username);

  if (!artist) {
    notFound();
  }

  const artworks = await getPublicUserArtworks(artist.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05445E] via-[#0A4D68] to-[#088395]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <img
              src={artist.avatarUrl || '/placeholder-avatar.png'}
              alt={artist.displayName || artist.username || 'Artist'}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {artist.displayName || artist.username}
                </h1>
                {artist.verifiedArtist && (
                  <div className="px-3 py-1 bg-cyan-500 rounded-full text-xs font-semibold text-white">
                    Verified
                  </div>
                )}
              </div>
              <p className="text-white/70 mb-4">@{artist.username}</p>
              {artist.bio && <p className="text-white mb-4 max-w-2xl">{artist.bio}</p>}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {artist.websiteUrl && (
                  <a
                    href={artist.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(artist.createdAt)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(artist.stats.artworkCount)}</div>
                  <div className="text-sm text-white/70">Artworks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(artist.stats.totalViews)}</div>
                  <div className="text-sm text-white/70">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(artist.stats.followerCount)}</div>
                  <div className="text-sm text-white/70">Followers</div>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
              Follow
            </button>
          </div>
        </div>

        {/* Artworks Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Artworks</h2>
          {artworks.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
              <p className="text-white/70">No published artworks yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <a
                  key={artwork.id}
                  href={`/artists/${artist.username}/${artwork.id}`}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all group"
                >
                  <div className="aspect-square bg-white/5 relative">
                    <img
                      src={artwork.watermarkedUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold">{formatNumber(artwork.viewCount || 0)}</div>
                        <div className="text-sm">views</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{artwork.title}</h3>
                    {artwork.description && (
                      <p className="text-sm text-white/70 mt-1 line-clamp-2">{artwork.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
