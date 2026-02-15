import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { Eye, Activity, Calendar, TrendingUp, MapPin, Shield } from 'lucide-react';
import { db } from '@/lib/db';
import { artworks, protectionLogs } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { formatDate, formatNumber } from '@/lib/utils';
import Link from 'next/link';

async function getArtworkAnalytics(artworkId: string, userId: string) {
  try {
    // Get artwork
    const [artwork] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, artworkId))
      .limit(1);

    if (!artwork || artwork.userId !== userId) {
      return null;
    }

    // Get protection logs
    const logs = await db
      .select()
      .from(protectionLogs)
      .where(eq(protectionLogs.artworkId, artworkId))
      .orderBy(desc(protectionLogs.createdAt))
      .limit(50);

    // Calculate stats
    const viewLogs = logs.filter((l) => l.eventType === 'view');
    const totalViews = artwork.viewCount || 0;

    // Group views by date (last 30 days)
    const viewsByDate = viewLogs.reduce((acc, log) => {
      const date = new Date(log.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top referrers (from IP addresses for now)
    const topReferrers = viewLogs.reduce((acc, log) => {
      const ip = log.ipAddress || 'Unknown';
      acc[ip] = (acc[ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedReferrers = Object.entries(topReferrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      artwork,
      logs,
      stats: {
        totalViews,
        viewsByDate,
        topReferrers: sortedReferrers,
        recentViewCount: viewLogs.length,
      },
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

export default async function ArtworkAnalyticsPage({
  params,
}: {
  params: Promise<{ artworkId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { artworkId } = await params;
  const data = await getArtworkAnalytics(artworkId, userId);

  if (!data) {
    notFound();
  }

  const { artwork, logs, stats } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/protection"
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-2 inline-block"
          >
            ← Back to Protection
          </Link>
          <h1 className="text-3xl font-bold text-white">{artwork.title}</h1>
          <p className="mt-2 text-white/70">Analytics & Protection Insights</p>
        </div>
        <Link
          href={`/gallery/${artwork.id}/edit`}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Edit Artwork
        </Link>
      </div>

      {/* Artwork Preview */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1">
            <img
              src={artwork.watermarkedUrl}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-2 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/70 mb-1">Status</div>
                <div className="text-white font-semibold capitalize">
                  {artwork.status}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Category</div>
                <div className="text-white font-semibold capitalize">
                  {artwork.category}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Protection Level</div>
                <div className="text-white font-semibold capitalize">
                  {artwork.protectionLevel}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">License</div>
                <div className="text-white font-semibold">
                  {artwork.licenseType}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Watermark ID</div>
                <div className="text-white font-mono text-sm">
                  {artwork.watermarkId}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-1">Published</div>
                <div className="text-white">
                  {artwork.publishedAt ? formatDate(artwork.publishedAt) : 'Not published'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-cyan-400" />
            <span className="text-3xl font-bold text-white">
              {formatNumber(stats.totalViews)}
            </span>
          </div>
          <div className="text-sm text-white/70">Total Views</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-white">
              {stats.recentViewCount}
            </span>
          </div>
          <div className="text-sm text-white/70">Recent Views</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-white">
              {logs.length}
            </span>
          </div>
          <div className="text-sm text-white/70">Total Events</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-white capitalize">
              {artwork.protectionLevel}
            </span>
          </div>
          <div className="text-sm text-white/70">Protection</div>
        </div>
      </div>

      {/* Views by Date */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Views Over Time</h2>
        </div>

        {Object.keys(stats.viewsByDate).length === 0 ? (
          <div className="text-center py-8 text-white/70">
            No view data available yet
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.viewsByDate)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .slice(0, 10)
              .map(([date, count]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-white/70">{date}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-48 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.viewsByDate))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-white font-semibold w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Top Referrers */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Top Viewers</h2>
        </div>

        {stats.topReferrers.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            No viewer data available yet
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topReferrers.map(([ip, count], index) => (
              <div key={ip} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-white font-mono text-sm">{ip}</span>
                </div>
                <span className="text-white font-semibold">{count} views</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            No activity yet
          </div>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-white capitalize">
                    {log.eventType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-white/70">
                  {log.ipAddress && (
                    <span className="font-mono text-xs">{log.ipAddress}</span>
                  )}
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
