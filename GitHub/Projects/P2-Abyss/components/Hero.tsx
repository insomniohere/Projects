'use client'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight animate-fade-in-up">
            Your Art.
            <br />
            <span className="glow-text">Your Legacy.</span>
            <br />
            <span className="text-white/40">Protected.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            A sanctuary for real, human-made art. Share your work without worrying about AI takeover or unauthorized reuse.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button className="px-8 py-4 ocean-gradient rounded-lg font-medium text-lg hover:opacity-90 transition-opacity shadow-2xl shadow-ocean/50">
              Join the Sanctuary
            </button>
            <button className="px-8 py-4 glass-effect rounded-lg font-medium text-lg hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-ocean-light">50K+</div>
              <div className="text-sm text-white/50">Protected Artists</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-ocean-light">1M+</div>
              <div className="text-sm text-white/50">Artworks Secured</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-ocean-light">100%</div>
              <div className="text-sm text-white/50">Human-Made</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
