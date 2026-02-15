'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Image as ImageIcon, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'artwork' | 'artist';
  title?: string;
  thumbnailUrl?: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  artworkCount?: number;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    artworks?: SearchResult[];
    artists?: SearchResult[];
  }>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 2) {
      setResults({});
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();

        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({});
    setIsOpen(false);
  };

  const hasResults = (results.artworks && results.artworks.length > 0) ||
                     (results.artists && results.artists.length > 0);

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artworks and artists..."
            className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 animate-spin" />
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#0A4D68] border border-white/20 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-white/70">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : hasResults ? (
            <>
              {/* Artworks */}
              {results.artworks && results.artworks.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-white/50 uppercase">
                    Artworks
                  </div>
                  {results.artworks.map((artwork) => (
                    <Link
                      key={artwork.id}
                      href={`/artists/${artwork.username || 'unknown'}/${artwork.id}`}
                      className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src={artwork.thumbnailUrl}
                        alt={artwork.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {artwork.title}
                        </div>
                        <div className="text-sm text-white/70 truncate">
                          by {artwork.displayName || artwork.username}
                        </div>
                      </div>
                      <ImageIcon className="w-4 h-4 text-white/50" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Artists */}
              {results.artists && results.artists.length > 0 && (
                <div className="p-2 border-t border-white/10">
                  <div className="px-3 py-2 text-xs font-semibold text-white/50 uppercase">
                    Artists
                  </div>
                  {results.artists.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.username || artist.id}`}
                      className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src={artist.avatarUrl || '/placeholder-avatar.png'}
                        alt={artist.displayName || artist.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {artist.displayName || artist.username}
                        </div>
                        <div className="text-sm text-white/70">
                          {artist.artworkCount} artworks
                        </div>
                      </div>
                      <User className="w-4 h-4 text-white/50" />
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <div className="p-2 border-t border-white/10">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-center text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-white/70">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
