import { notFound } from 'next/navigation';
import { Eye, Shield, Calendar, Share2, Heart, Download, Flag } from 'lucide-react';
import { getArtworkById } from '@/lib/api/artworks';
import { formatDate, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ username: string; artworkId: string }>;
}) {
  const { username, artworkId } = await params;
  const result = await getArtworkById(artworkId);

  if (!result || !result.artwork) {
    notFound();
  }

  const { artwork, user } = result;

  // Check if artwork is published
  if (artwork.status !== 'published') {
    notFound();
  }

  const LICENSE_LABELS: Record<string, string> = {
    'all-rights-reserved': 'All Rights Reserved',
    'cc-by': 'CC BY (Attribution)',
    'cc-by-nc': 'CC BY-NC (Attribution-NonCommercial)',
    'cc-by-sa': 'CC BY-SA (Attribution-ShareAlike)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05445E] via-[#0A4D68] to-[#088395]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Image */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="relative bg-black">
                <img
                  src={artwork.watermarkedUrl}
                  alt={artwork.title}
                  className="w-full h-auto"
                />

                {/* Protection Overlay */}
                <div className="absolute top-4 right-4 px-4 py-2 bg-cyan-500/90 backdrop-blur-sm rounded-lg flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Protected</span>
                </div>
              </div>

              {/* Image Actions */}
              <div className="p-6 flex flex-wrap gap-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <Heart className="w-5 h-5" />
                  <span>Like</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <Flag className="w-5 h-5" />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-white mb-3">Description</h2>
                <p className="text-white/90 whitespace-pre-wrap">{artwork.description}</p>
              </div>
            )}

            {/* Protection Details */}
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Protection Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Watermark ID</span>
                  <span className="text-white font-mono text-sm">{artwork.watermarkId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Protection Level</span>
                  <span className="text-white capitalize">{artwork.protectionLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">License</span>
                  <span className="text-white">{LICENSE_LABELS[artwork.licenseType] || artwork.licenseType}</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                <p className="text-sm text-cyan-200">
                  🛡️ This artwork is protected by Abyss watermarking technology.
                  Unauthorized use or AI training on this image is prohibited.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Details */}
          <div className="space-y-6">
            {/* Title and Artist */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h1 className="text-2xl font-bold text-white mb-4">{artwork.title}</h1>

              {/* Artist Info */}
              <Link
                href={`/artists/${user?.username || user?.id}`}
                className="flex items-center space-x-3 mb-6 hover:bg-white/5 p-3 -m-3 rounded-lg transition-colors"
              >
                <img
                  src={user?.avatarUrl || '/placeholder-avatar.png'}
                  alt={user?.displayName || user?.username || 'Artist'}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                <div>
                  <div className="font-semibold text-white">
                    {user?.displayName || user?.username}
                  </div>
                  <div className="text-sm text-white/70">@{user?.username}</div>
                </div>
              </Link>

              <button className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                Follow Artist
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white/70">
                    <Eye className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <span className="text-white font-semibold">
                    {formatNumber(artwork.viewCount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span>Published</span>
                  </div>
                  <span className="text-white">
                    {artwork.publishedAt ? formatDate(artwork.publishedAt) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <h3 className="font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/explore?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="font-semibold text-white mb-3">Category</h3>
              <Link
                href={`/explore?category=${artwork.category}`}
                className="inline-block px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 transition-colors"
              >
                {artwork.category}
              </Link>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link
            href="/explore"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
