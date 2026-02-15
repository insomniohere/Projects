export default function Features() {
  const features = [
    {
      title: 'AI-Proof Protection',
      description: 'Advanced watermarking and content protection that prevents AI training and unauthorized scraping.',
      icon: '🛡️',
    },
    {
      title: 'Authenticity Verified',
      description: 'Every piece is verified as human-made with blockchain-backed certificates of authenticity.',
      icon: '✓',
    },
    {
      title: 'Creator Rights',
      description: 'Full control over your work with customizable licensing and usage rights management.',
      icon: '⚖️',
    },
    {
      title: 'Community First',
      description: 'Connect with fellow artists in a space dedicated to genuine human creativity and expression.',
      icon: '🤝',
    },
  ]

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Built for <span className="text-ocean-light">Human Artists</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Every feature designed to protect, preserve, and celebrate authentic human creativity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 glass-effect rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
