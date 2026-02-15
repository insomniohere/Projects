export default function Protection() {
  return (
    <section id="protection" className="relative py-32 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1 ocean-gradient" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 rounded-full glass-effect">
              <span className="text-sm text-ocean-light font-medium">Protection Technology</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              AI Can't Touch
              <br />
              <span className="text-ocean-light">What We Protect</span>
            </h2>

            <p className="text-xl text-white/70 leading-relaxed">
              Our multi-layered protection system combines invisible watermarking,
              content fingerprinting, and legal safeguards to ensure your art remains yours.
            </p>

            <div className="space-y-6 pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Invisible Watermarks</h4>
                  <p className="text-white/60">
                    Imperceptible markers that survive crops, filters, and transformations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Active Monitoring</h4>
                  <p className="text-white/60">
                    24/7 scanning across the web to detect unauthorized use and AI training attempts.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Instant Takedowns</h4>
                  <p className="text-white/60">
                    Automated DMCA filing and enforcement when violations are detected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl glass-effect p-12 flex items-center justify-center relative overflow-hidden">
              {/* Animated protection visual */}
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full ocean-gradient opacity-50 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-4 border-ocean/30 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">🎨</div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-6 -right-6 px-6 py-3 glass-effect rounded-full">
              <span className="text-sm font-medium">Protected</span>
            </div>
            <div className="absolute -bottom-6 -left-6 px-6 py-3 glass-effect rounded-full">
              <span className="text-sm font-medium">Verified Human</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
