export default function CTA() {
  return (
    <section className="relative py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="relative rounded-3xl ocean-gradient p-16 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Join the Movement
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Be part of a community that values authentic human creativity.
              Protect your art, connect with collectors, and build your legacy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button className="px-8 py-4 bg-white text-ocean-dark rounded-lg font-medium text-lg hover:bg-white/90 transition-colors shadow-2xl">
                Start Protecting Today
              </button>
              <button className="px-8 py-4 glass-effect rounded-lg font-medium text-lg hover:bg-white/10 transition-colors">
                Schedule a Demo
              </button>
            </div>

            <div className="pt-8 text-white/70 text-sm">
              <p>No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
