import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Image, Eye, Shield } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { db } from '@/lib/db';
import { artworks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user's artworks
  const userArtworks = await db
    .select()
    .from(artworks)
    .where(eq(artworks.userId, userId))
    .orderBy(desc(artworks.createdAt))
    .limit(6);

  // Calculate stats
  const totalArtworks = userArtworks.length;
  const totalViews = userArtworks.reduce((sum, artwork) => sum + (artwork.viewCount || 0), 0);
  const protectedArtworks = userArtworks.filter((artwork) => artwork.status === 'published').length;

  // Mock activity data (will be replaced with real data later)
  const recentActivity = [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName || 'Artist'}!
        </h1>
        <p className="mt-2 text-white/70">
          Here's what's happening with your artwork today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Artworks"
          value={totalArtworks}
          icon={Image}
        />
        <StatCard
          title="Total Views"
          value={totalViews}
          icon={Eye}
        />
        <StatCard
          title="Protected"
          value={protectedArtworks}
          icon={Shield}
          suffix="artworks"
        />
      </div>

      {/* Recent Uploads */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Uploads</h2>
        {userArtworks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
            <Image className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No artworks yet</h3>
            <p className="text-white/70 mb-6">Upload your first artwork to get started!</p>
            <a
              href="/upload"
              className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Upload Artwork
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all group"
              >
                <div className="aspect-square bg-white/5 relative">
                  <img
                    src={artwork.thumbnailUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white mr-2" />
                    <span className="text-white font-semibold">{artwork.viewCount || 0} views</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{artwork.title}</h3>
                  <p className="text-sm text-white/70 mt-1">
                    {artwork.status === 'published' ? (
                      <span className="text-green-400">Published</span>
                    ) : (
                      <span className="text-yellow-400">Draft</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivity} />
    </div>
  );
}
