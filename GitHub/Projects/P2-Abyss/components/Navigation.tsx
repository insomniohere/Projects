'use client'

import { useState, useEffect } from 'react'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect py-4' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full ocean-gradient flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Abyss</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white/70 hover:text-white transition-colors">
            Features
          </a>
          <a href="#protection" className="text-white/70 hover:text-white transition-colors">
            Protection
          </a>
          <a href="#showcase" className="text-white/70 hover:text-white transition-colors">
            Showcase
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white transition-colors">
            Sign In
          </button>
          <button className="px-6 py-2.5 ocean-gradient rounded-lg font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
