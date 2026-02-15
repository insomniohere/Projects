import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Filter, Grid, List } from 'lucide-react';
import { getUserArtworks } from '@/lib/api/artworks';
import ArtworkGrid from '@/components/artwork/ArtworkGrid';

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; category?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  const filter = params.filter || 'all';
  const category = params.category;

  // Fetch user's artworks
  const artworks = await getUserArtworks(userId, {
    status: filter === 'all' ? undefined : (filter as 'draft' | 'published'),
    limit: 12,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Gallery</h1>
          <p className="mt-2 text-white/70">
            Manage and organize your artwork collection
          </p>
        </div>

        <a
          href="/upload"
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Upload New
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-white/70" />
          <span className="text-sm font-medium text-white">Filter:</span>
        </div>

        <div className="flex gap-2">
          {['all', 'published', 'draft'].map((f) => (
            <a
              key={f}
              href={`?filter=${f}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </a>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="text-2xl font-bold text-white">{artworks.length}</div>
          <div className="text-sm text-white/70">Total Artworks</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="text-2xl font-bold text-white">
            {artworks.filter((a) => a.status === 'published').length}
          </div>
          <div className="text-sm text-white/70">Published</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="text-2xl font-bold text-white">
            {artworks.reduce((sum, a) => sum + (a.viewCount || 0), 0)}
          </div>
          <div className="text-sm text-white/70">Total Views</div>
        </div>
      </div>

      {/* Gallery Grid */}
      <ArtworkGrid
        initialArtworks={artworks}
        showActions={true}
        apiUrl={`/api/artworks?myArtworks=true&filter=${filter}`}
      />
    </div>
  );
}
