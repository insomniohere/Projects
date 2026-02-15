import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Protection from '@/components/Protection'
import Showcase from '@/components/Showcase'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <Features />
      <Protection />
      <Showcase />
      <CTA />
      <Footer />
    </main>
  )
}
