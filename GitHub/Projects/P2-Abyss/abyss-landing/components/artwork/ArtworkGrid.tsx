'use client';

import { useState, useEffect } from 'react';
import ArtworkCard from './ArtworkCard';
import { Loader2 } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl: string;
  watermarkedUrl: string;
  viewCount: number;
  status: string;
  category: string;
  protectionLevel: string;
}

interface ArtworkGridProps {
  initialArtworks?: Artwork[];
  userId?: string;
  showActions?: boolean;
  apiUrl?: string;
  username?: string;
}

export default function ArtworkGrid({
  initialArtworks = [],
  showActions = false,
  apiUrl,
  username,
}: ArtworkGridProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialArtworks.length);

  const loadMore = async () => {
    if (!apiUrl || isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}?offset=${offset}&limit=12`);
      const data = await response.json();

      if (data.artworks && data.artworks.length > 0) {
        setArtworks([...artworks, ...data.artworks]);
        setOffset(offset + data.artworks.length);

        if (data.artworks.length < 12) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more artworks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (artworkId: string) => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArtworks(artworks.filter((a) => a.id !== artworkId));
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
  };

  // Infinite scroll
  useEffect(() => {
    if (!apiUrl) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [artworks, isLoading, hasMore]);

  if (artworks.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">No artworks found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            showActions={showActions}
            onDelete={handleDelete}
            username={username}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {!hasMore && artworks.length > 0 && (
        <div className="text-center py-8">
          <p className="text-white/50">No more artworks to load</p>
        </div>
      )}
    </>
  );
}
