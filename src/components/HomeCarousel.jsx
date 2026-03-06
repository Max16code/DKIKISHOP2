// src/components/HomeCarousel.jsx (full updated file)
'use client'

import { useEffect, useCallback, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

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

    const [currentStyles, setCurrentStyles] = useState({})

    useEffect(() => {
        if (!emblaApi) return

        const onSelect = () => {
            const newStyles = {}
            emblaApi.slideNodes().forEach((node, index) => {
                const randomStyle = transitionStyles[Math.floor(Math.random() * transitionStyles.length)]
                newStyles[index] = randomStyle
            })
            setCurrentStyles(newStyles)
        }

        emblaApi.on('select', onSelect)
        onSelect()

        return () => emblaApi.off('select', onSelect)
    }, [emblaApi])

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    return (
        <div className="relative w-full overflow-hidden mt-6 md:mt-8">
            <div className="embla" ref={emblaRef}>
                <div className="embla__container flex">
                    {/* Product slides */}
                    {products.map((product, index) => (
                        <div
                            key={product._id}
                            className="embla__slide min-w-full opacity-0 transition-all duration-1800 ease-in-out data-[active=true]:opacity-100"
                            data-active={emblaApi?.selectedScrollSnap() === index}
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
                    <div className="embla__slide min-w-full ">
                        <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-pink-400 via-rose-400 to-purple-600 overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)]"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>
                            </div>

                            <div className="relative z-10 text-center px-6 max-w-3xl">
                                <div className="mb-4 md:mb-6">
                                    <span className="text-6xl md:text-8xl">🛍️</span>
                                </div>

                                <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-5 drop-shadow-lg tracking-wide">
                                    Fill up your cart
                                </h3>

                                <p className="text-xl sm:text-2xl md:text-4xl font-extrabold text-pink-200 mb-4 md:mb-6 drop-shadow">
                                    babygirrrrrlllllll 💋
                                </p>


                            </div>
                        </div>
                    </div>

                    {/* NEW: "Select how you would prefer to pickup" slide */}
                    <div className="embla__slide min-w-full transition-all duration-1800 ease-in-out data-[active=true]:opacity-100">
                        <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 overflow-hidden">
                            <div className="absolute inset-0 opacity-30 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.4)_0%,transparent_60%)]"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.3)_0%,transparent_70%)]"></div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-3xl">
                                <div className="mb-4 md:mb-6">
                                    <img
                                        src="/images/rider.avif"  // ← your rider image path (replace if needed)
                                        alt="Delivery rider"
                                        className="w-32 h-32 md:w-48 md:h-48 mt-14 object-cover rounded-full shadow-2xl border-4 border-white/30 ring-2 ring-pink-300/50"
                                    />
                                </div>

                                <h3 className="text-2xl sm:text-3xl md:text-3xl font-medium text-white mb-3 md:mb-5 drop-shadow-lg tracking-wide">
                                    Select how you would prefer to pickup
                                </h3>

                                <p className="text-lg md:text-xl text-pink-100 opacity-90">
                                    Fast • Safe • Just for you 💕
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* About DKIKISHOP */}
                    <div className="embla__slide min-w-full transition-all duration-1500 ease-in-out data-[active=true]:opacity-100">
                        <div className="relative h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-pink-900/80 via-purple-900/80 to-indigo-900/80">
                            <div className="text-center px-6 max-w-3xl">
                                <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-6 drop-shadow-lg">
                                    About DKIKISHOP
                                </h3>
                                <p className="text-base md:text-xl text-pink-100">
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
                                <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-6 drop-shadow-lg">
                                    Our Vibe
                                </h3>
                                <p className="text-base md:text-xl text-purple-100">
                                    Soft elegance • Bold confidence • Endless charm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Arrows – slow & feminine */}
            <button
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110"
                onClick={() => {
                    if (emblaApi) {
                        emblaApi.scrollPrev()
                        emblaApi.reInit({ speed: 8 }) // slow down scroll speed on click
                    }
                }}
                aria-label="Previous slide"
            >
                ←
            </button>

            <button
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110"
                onClick={() => {
                    if (emblaApi) {
                        emblaApi.scrollNext()
                        emblaApi.reInit({ speed: 8 }) // slow down scroll speed on click
                    }
                }}
                aria-label="Next slide"
            >
                →
            </button>
        </div>
    )
}