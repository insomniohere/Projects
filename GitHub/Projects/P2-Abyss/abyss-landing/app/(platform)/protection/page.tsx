import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Shield, Eye, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { artworks, protectionLogs } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { formatDate, formatNumber } from '@/lib/utils';
import ProtectionStatus from '@/components/protection/ProtectionStatus';
import Link from 'next/link';

async function getProtectionData(userId: string) {
  try {
    // Get user's artworks
    const userArtworks = await db
      .select()
      .from(artworks)
      .where(eq(artworks.userId, userId))
      .orderBy(desc(artworks.createdAt));

    // Get recent protection events
    const artworkIds = userArtworks.map((a) => a.id);

    let recentEvents = [];
    if (artworkIds.length > 0) {
      recentEvents = await db
        .select({
          log: protectionLogs,
          artwork: artworks,
        })
        .from(protectionLogs)
        .leftJoin(artworks, eq(protectionLogs.artworkId, artworks.id))
        .where(sql`${protectionLogs.artworkId} = ANY(${artworkIds})`)
        .orderBy(desc(protectionLogs.createdAt))
        .limit(20);
    }

    // Calculate stats
    const totalArtworks = userArtworks.length;
    const protectedArtworks = userArtworks.filter((a) => a.status === 'published').length;
    const totalViews = userArtworks.reduce((sum, a) => sum + (a.viewCount || 0), 0);
    const totalEvents = recentEvents.length;

    // Group by protection level
    const protectionLevels = userArtworks.reduce((acc, a) => {
      acc[a.protectionLevel] = (acc[a.protectionLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      artworks: userArtworks,
      recentEvents,
      stats: {
        totalArtworks,
        protectedArtworks,
        totalViews,
        totalEvents,
        protectionLevels,
      },
    };
  } catch (error) {
    console.error('Error fetching protection data:', error);
    return {
      artworks: [],
      recentEvents: [],
      stats: {
        totalArtworks: 0,
        protectedArtworks: 0,
        totalViews: 0,
        totalEvents: 0,
        protectionLevels: {},
      },
    };
  }
}

const EVENT_ICONS: Record<string, any> = {
  view: Eye,
  watermark_applied: Shield,
  watermark_verified: CheckCircle,
  violation_detected: AlertTriangle,
  download_attempt: Activity,
};

const EVENT_LABELS: Record<string, string> = {
  view: 'Viewed',
  watermark_applied: 'Watermark Applied',
  watermark_verified: 'Watermark Verified',
  violation_detected: 'Violation Detected',
  download_attempt: 'Download Attempt',
};

export default async function ProtectionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const data = await getProtectionData(userId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Protection Dashboard</h1>
        <p className="mt-2 text-white/70">
          Monitor your artwork protection and security
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">
              {data.stats.protectedArtworks}
            </span>
          </div>
          <div className="text-sm text-white/70">Protected Artworks</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {formatNumber(data.stats.totalViews)}
            </span>
          </div>
          <div className="text-sm text-white/70">Total Views</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {data.stats.totalEvents}
            </span>
          </div>
          <div className="text-sm text-white/70">Protection Events</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">0</span>
          </div>
          <div className="text-sm text-white/70">Violations Detected</div>
        </div>
      </div>

      {/* Protection Levels Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Protection Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {data.stats.protectionLevels['basic'] || 0}
            </div>
            <div className="text-sm text-white/70">Basic Protection</div>
          </div>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">
              {data.stats.protectionLevels['standard'] || 0}
            </div>
            <div className="text-sm text-white/70">Standard Protection</div>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {data.stats.protectionLevels['enhanced'] || 0}
            </div>
            <div className="text-sm text-white/70">Enhanced Protection</div>
          </div>
        </div>
      </div>

      {/* Artworks List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Artworks</h2>
          <Link
            href="/gallery"
            className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
          >
            View All →
          </Link>
        </div>

        {data.artworks.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No artworks yet</p>
            <Link
              href="/upload"
              className="inline-block mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Upload Your First Artwork
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.artworks.slice(0, 5).map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <img
                    src={artwork.thumbnailUrl}
                    alt={artwork.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {artwork.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-white/70">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(artwork.viewCount || 0)}</span>
                      </span>
                      <span className="capitalize">{artwork.protectionLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-full text-xs font-semibold">
                    Protected
                  </span>
                  <Link
                    href={`/gallery/${artwork.id}/analytics`}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition-colors"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>

        {data.recentEvents.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            No recent activity
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentEvents.map((event) => {
              const Icon = EVENT_ICONS[event.log.eventType] || Activity;
              const label = EVENT_LABELS[event.log.eventType] || event.log.eventType;

              return (
                <div
                  key={event.log.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white">
                        {label} - {event.artwork?.title}
                      </div>
                      <div className="text-xs text-white/50">
                        {formatDate(event.log.createdAt)}
                      </div>
                    </div>
                  </div>
                  {event.log.ipAddress && (
                    <div className="text-xs text-white/50 font-mono">
                      {event.log.ipAddress}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-3">Protection Tips</h3>
        <ul className="space-y-2 text-sm text-cyan-200">
          <li>• Use Enhanced protection for your most valuable artworks</li>
          <li>• Monitor view patterns to detect suspicious activity</li>
          <li>• Report any unauthorized use immediately</li>
          <li>• Keep your watermark IDs private and secure</li>
        </ul>
      </div>
    </div>
  );
}
