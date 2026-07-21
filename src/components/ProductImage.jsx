'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ProductImage({
  product,
  heightMobile = 'h-50',
  heightTablet = 'sm:h-48',
  heightDesktop = 'md:h-56',
  fit = 'object-contain',
  fallback = '/images/fallback.jpg',
  showStockBadge = true,
  showOutOfStockOverlay = true,
}) {
  const [current, setCurrent] = useState(0)

  if (!product) {
    return <div className={`w-full ${heightMobile} ${heightTablet} ${heightDesktop} bg-gray-200 animate-pulse rounded-3xl shadow-lg`} />
  }

  const imgList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : typeof product.image === 'string'
      ? [product.image]
      : [fallback]

  // Rotate images if multiple
  useEffect(() => {
    if (imgList.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imgList.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [imgList.length])

  const stockCount = product.stock ?? product.quantity ?? 0
  const inStock = product.isAvailable !== false && stockCount > 0

  const imgSrc = imgList[current] || fallback

  return (
    <div className="relative">
      {/* Out of Stock Overlay */}
      {showOutOfStockOverlay && !inStock && (
        <div className="absolute inset-0 bg-black/50 rounded-3xl z-10 flex items-center justify-center">
          <span className="text-white font-bold text-lg bg-red-600/80 px-4 py-2 rounded-full">
            OUT OF STOCK
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className={`relative w-full ${heightMobile} ${heightTablet} ${heightDesktop} overflow-hidden rounded-3xl shadow-lg`}>
        <Image
          src={imgSrc}
          alt={product.title || 'Product'}
          fill
          sizes="100vw"
          style={{ objectFit: fit }}
          unoptimized
          className={`${!inStock ? 'grayscale opacity-80' : 'opacity-100'} transition-all duration-700 ease-in-out`}
          onError={(e) => (e.currentTarget.src = fallback)}
        />

      </div>
    </div>
  )
}
