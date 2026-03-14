// src/components/HomeCarousel.jsx
'use client'

import { useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'

const transitionStyles = [
  'transition-all duration-1000 ease-in-out opacity-0 scale-95 data-[active=true]:opacity-100 data-[active=true]:scale-100',
  'transition-all duration-1200 ease-out -translate-x-20 opacity-0 data-[active=true]:translate-x-0 data-[active=true]:opacity-100',
  'transition-all duration-1100 ease-in-out translate-x-20 rotate-2 opacity-0 data-[active=true]:translate-x-0 data-[active=true]:rotate-0 data-[active=true]:opacity-100',
  'transition-all duration-1300 ease-out translate-y-16 blur-sm opacity-0 data-[active=true]:translate-y-0 data-[active=true]:blur-none data-[active=true]:opacity-100',
  'transition-all duration-1400 ease-in-out -translate-x-12 -translate-y-12 opacity-0 brightness-75 data-[active=true]:translate-x-0 data-[active=true]:translate-y-0 data-[active=true]:opacity-100 data-[active=true]:brightness-100'
]

export default function HomeCarousel({ products = [] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      dragFree: true,
      speed: 8,
    },
    [
      Autoplay({
        delay: 5500,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      })
    ]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="relative w-full overflow-hidden mt-6 md:mt-8 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20">
      {/* Liquid glass shine animation across the whole carousel */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none z-10" />

      {/* Soft inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/5 via-purple-100/5 to-transparent pointer-events-none z-10" />

      {/* Carousel content */}
      <div className="embla relative z-20" ref={emblaRef}>
        <div className="embla__container flex">
          {/* Product slides */}
          {products.map((product, index) => (
            <div
              key={product._id}
              className="embla__slide min-w-full"
            >
              <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-b from-black/70 via-black/50 to-black/70 overflow-hidden">
                <img
                  src={product.images?.[0] || '/images/fallback.jpg'}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl">
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg">
                    {product.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-100 line-clamp-2 md:line-clamp-3 drop-shadow">
                    {product.description || 'Timeless elegance, crafted for you.'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* "Fill up your cart" slide */}
          <div className="embla__slide min-w-full">
            <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-pink-400 via-rose-400 to-purple-600 overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>
              </div>

              <div className="relative z-10 text-center px-6 max-w-3xl">
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <h3 className="text-2xl sm:text-3xl font-serif md:text-5xl font-bold text-white drop-shadow-lg tracking-wide">
                    Fill up your cart
                  </h3>

                  <Link href="/cart" className="group relative">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-full transition-all duration-300 transform group-hover:scale-110 border border-yellow-400/40 shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-yellow-400 group-hover:text-white transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>

                      <span className="absolute -top-1 -right-1 bg-red-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                        10
                      </span>
                    </div>
                  </Link>
                </div>

                <p className="text-xl sm:text-2xl md:text-4xl font-serif font-extrabold text-pink-600 mb-4 md:mb-6 drop-shadow">
                  babygirrrrrlllllll 💋
                </p>
              </div>
            </div>
          </div>

          {/* Rider / Delivery slide */}
          <div className="embla__slide min-w-full">
            <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 overflow-hidden">
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.4)_0%,transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.3)_0%,transparent_70%)]"></div>
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-3xl">
                <div className="mt-1 md:mb-6">
                  <img
                    src="/images/rider.avif"
                    alt="Delivery rider"
                    className="w-32 h-32 md:w-48 md:h-48 mt-14 object-cover rounded-full shadow-2xl border-4 border-white/30 ring-2 ring-pink-300/50"
                  />
                </div>

                <h3 className="text-xl sm:text-xl md:text-xl font-extralight md:font-extralight font-serif text-purple-300 mb-10 md:mb-20">
                  Select suitable delivery method
                </h3>
              </div>
            </div>
          </div>

          {/* About DKIKISHOP */}
          <div className="embla__slide min-w-full">
            <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-pink-900/80 via-purple-900/80 to-indigo-900/80">
              <div className="text-center px-6 max-w-3xl">
                <h3 className="text-3xl md:text-5xl font-bold text-yellow-400 font-serif mb-3 md:mb-6 drop-shadow-lg">
                  DKIKISHOP
                </h3>
                <p className="text-base md:text-xl font-serif text-purple-400">
                  Where luxury meets affordability.<br />
                  Elegant pieces for the modern woman.
                </p>
              </div>
            </div>
          </div>

          {/* Our Vibe */}
          <div className="embla__slide min-w-full">
            <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80">
              <div className="text-center px-6 max-w-3xl">
                <h3 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-3 md:mb-6 font-serif drop-shadow-lg">
                  Our Vibe
                </h3>
                <p className="text-base md:text-xl font-serif text-purple-400">
                  Soft elegance • Bold confidence • Endless charm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows – glass style */}
      <button
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 sm:p-4 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110 z-30"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        ←
      </button>

      <button
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 sm:p-4 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110 z-30"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  )
}