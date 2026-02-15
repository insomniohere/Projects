export default function Showcase() {
  const artworks = [
    { title: 'Ocean Dreams', artist: 'Sarah Chen', type: 'Digital Painting' },
    { title: 'Urban Solitude', artist: 'Marcus Lee', type: 'Photography' },
    { title: 'Abstract Harmony', artist: 'Emma Rodriguez', type: 'Mixed Media' },
    { title: 'Nature\'s Whisper', artist: 'James Park', type: 'Illustration' },
  ]

  return (
    <section id="showcase" className="relative py-32 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Featured <span className="text-ocean-light">Artworks</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Discover authentic human creativity from artists around the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {artworks.map((artwork, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl glass-effect hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Placeholder for artwork image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-ocean-dark via-ocean to-ocean-light flex items-center justify-center">
                <span className="text-6xl opacity-50">🎨</span>
              </div>

              {/* Overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold mb-2">{artwork.title}</h3>
                <p className="text-white/80 mb-1">by {artwork.artist}</p>
                <p className="text-sm text-ocean-light">{artwork.type}</p>
              </div>

              {/* Verified badge */}
              <div className="absolute top-4 right-4 px-3 py-1 glass-effect rounded-full text-xs font-medium flex items-center space-x-1">
                <span className="text-ocean-light">✓</span>
                <span>Verified Human</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-4 glass-effect rounded-lg font-medium hover:bg-white/10 transition-colors">
            Explore Full Gallery
          </button>
        </div>
      </div>
    </section>
  )
}
