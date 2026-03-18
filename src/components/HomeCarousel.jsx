'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomeCarousel() {
  const [slides, setSlides] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const categoryColors = {
    blazers: '#2563eb',
    jeans: '#1e40af',
    tops: '#7e22ce',
    skirts: '#db2777',
    activewears: '#ea580c',
    dresses: '#be123c',
    accessories: '#a16207',
    shorts: '#15803d'
  }

  useEffect(() => {
    const cachedSlides = sessionStorage.getItem('carouselSlides')
    if (cachedSlides) {
      setSlides(JSON.parse(cachedSlides))
      setLoading(false)
      return
    }

    const fetchCarouselData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/carousel')
        const data = await res.json()

        if (data.success && data.items) {
          setSlides(data.items)
          sessionStorage.setItem('carouselSlides', JSON.stringify(data.items))
        }
      } catch (error) {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }

    fetchCarouselData()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index) => setCurrentIndex(index)
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length)

  if (loading) {
    return (
      <div className="relative mt-12 px-4 sm:px-6 lg:px-8">
        <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full bg-gray-800 animate-pulse rounded-lg" />
      </div>
    )
  }

  if (slides.length === 0) return null

  return (
    <div className="relative mt-12 px-4 sm:px-6 lg:px-8">
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full overflow-hidden rounded-lg shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.slug}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {slide.image ? (
              <img
                src={slide.image}
                alt={slide.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.backgroundColor = categoryColors[slide.slug]
                }}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: categoryColors[slide.slug] || '#4b5563' }}
              >
                <div
                  className="w-full h-full opacity-10"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 10px, transparent 10px, transparent 20px)'
                  }}
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                {slide.name}
              </h2>

              {!slide.hasProduct && (
                <p className="text-yellow-400 text-lg mb-6 drop-shadow-lg">
                  Collection Coming Soon
                </p>
              )}

              <Link href={`/category/${slide.slug}`}>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-10 py-5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                  {slide.hasProduct ? 'Shop Collection →' : 'Browse →'}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition backdrop-blur-sm text-2xl"
      >
        ←
      </button>
      <button
        onClick={goNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition backdrop-blur-sm text-2xl"
      >
        →
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-yellow-500 w-4'
                : 'bg-white/50 hover:bg-white/80 w-2'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}