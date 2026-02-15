'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, MoreVertical, Edit, Trash2, Share2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

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

interface ArtworkCardProps {
  artwork: Artwork;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  username?: string;
}

export default function ArtworkCard({
  artwork,
  showActions = false,
  onDelete,
  username,
}: ArtworkCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const artworkUrl = username
    ? `/artists/${username}/${artwork.id}`
    : `/gallery/${artwork.id}`;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this artwork?')) {
      if (onDelete) {
        onDelete(artwork.id);
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all group">
      {/* Image */}
      <Link href={artworkUrl}>
        <div className="aspect-square bg-white/5 relative overflow-hidden">
          <img
            src={artwork.thumbnailUrl}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-white font-semibold">
                {formatNumber(artwork.viewCount || 0)} views
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {artwork.status === 'draft' && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
              Draft
            </div>
          )}

          {/* Protection Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-cyan-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
            Protected
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link href={artworkUrl}>
              <h3 className="font-semibold text-white truncate hover:text-cyan-400 transition-colors">
                {artwork.title}
              </h3>
            </Link>
            {artwork.description && (
              <p className="text-sm text-white/70 mt-1 line-clamp-2">
                {artwork.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-white/50">{artwork.category}</span>
              <span className="text-white/30">•</span>
              <span className="text-xs text-white/50">
                {formatNumber(artwork.viewCount || 0)} views
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A4D68] border border-white/20 rounded-lg shadow-xl z-20 overflow-hidden">
                    <Link
                      href={`/gallery/${artwork.id}/edit`}
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition-colors text-white"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}${artworkUrl}`
                        );
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition-colors text-white"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-red-500/20 transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
