'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomeCarousel() {
  const [slides, setSlides] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // ALL 8 CATEGORIES - hardcoded so they always show
  const categories = [
    { name: 'Blazers', slug: 'blazers' },
    { name: 'Jeans', slug: 'jeans' },
    { name: 'Tops', slug: 'tops' },
    { name: 'Skirts', slug: 'skirts' },
    { name: 'Activewears', slug: 'activewears' },
    { name: 'Dresses', slug: 'dresses' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Shorts', slug: 'shorts' }
  ]

  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        setLoading(true)
        
        // Fetch ONE product from EACH category
        const slidesWithImages = await Promise.all(
          categories.map(async (category) => {
            try {
              // Try to fetch one product from this category
              const res = await fetch(`/api/getproducts/${category.slug}?limit=1`)
              const data = await res.json()
              
              // Extract product image based on your API response format
              let productImage = null
              let hasProducts = false
              
              if (data.success && data.products && data.products.length > 0) {
                hasProducts = true
                const product = data.products[0]
                productImage = product.images?.[0] || null
              } else if (Array.isArray(data) && data.length > 0) {
                hasProducts = true
                productImage = data[0].images?.[0] || null
              }

              return {
                name: category.name,
                slug: category.slug,
                productImage: productImage,
                hasProducts: hasProducts
              }
            } catch (error) {
              console.error(`Error fetching ${category.slug}:`, error)
              return {
                name: category.name,
                slug: category.slug,
                productImage: null,
                hasProducts: false
              }
            }
          })
        )

        console.log('Carousel slides:', slidesWithImages)
        setSlides(slidesWithImages)
        
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryImages()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index) => setCurrentIndex(index)
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length)

  if (loading) {
    return (
      <div className="relative mt-12 px-4 sm:px-6 lg:px-8">
        <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mt-12 px-4 sm:px-6 lg:px-8">
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full overflow-hidden rounded-lg shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.slug}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {slide.productImage ? (
                <img
                  src={slide.productImage}
                  alt={slide.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(`Image failed for ${slide.slug}`)
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = `<div class="w-full h-full" style="background: linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)"></div>`
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{ 
                    background: slide.hasProducts 
                      ? 'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)'
                      : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  }}
                >
                  {!slide.hasProducts && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/30 text-sm">No products yet</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </div>

            

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                {slide.name}
              </h2>

              {!slide.hasProducts && (
                <p className="text-yellow-400 text-lg mb-6 drop-shadow-lg">
                  Collection Coming Soon
                </p>
              )}

              <Link href={`/category/${slide.slug}`}>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-10 py-5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                  {slide.hasProducts ? 'Shop Collection →' : 'Browse →'}
                </button>
              </Link>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition backdrop-blur-sm text-2xl"
        >
          ←
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition backdrop-blur-sm text-2xl"
        >
          →
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((slide, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-yellow-500 w-8'
                  : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
              onClick={() => goToSlide(index)}
              title={slide.name}
            />
          ))}
        </div>

        {/* Category indicators at bottom */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 z-30">
          {slides.map((slide, index) => (
            <button
              key={slide.slug}
              onClick={() => goToSlide(index)}
              className={`text-sm font-medium transition-all ${
                index === currentIndex
                  ? 'text-yellow-500'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {slide.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}