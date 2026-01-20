// 

// new code////////

'use client'
import { useState, useEffect } from 'react'

export default function ProductImage({
  product,
  heightMobile = 'h-40',
  heightTablet = 'sm:h-48',
  heightDesktop = 'md:h-56',
  fit = 'object-contain',
  fallback = '/images/fallback.jpg',
  showStockBadge = true,
  showOutOfStockOverlay = true,
}) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!product) return

    const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrent(prev => (prev === 0 ? 1 : 0))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [product])

  // Stock logic
  const isAvailable = product?.isAvailable !== false
  const stockCount = product?.stock || product?.quantity || 0
  const inStock = isAvailable && stockCount > 0

  const getStockBadgeText = () => {
    if (!inStock) return 'Out of Stock'
    if (stockCount <= 5) return `Low Stock: ${stockCount}`
    if (stockCount <= 10) return `${stockCount} left`
    return 'In Stock'
  }

  const getStockBadgeColor = () => {
    if (!inStock) return 'bg-red-500/90 text-white'
    if (stockCount <= 5) return 'bg-red-500/90 text-white'
    if (stockCount <= 10) return 'bg-yellow-500/90 text-white'
    return 'bg-green-500/90 text-white'
  }

  // Cloudinary / MongoDB URL normalization
  const normalizeUrl = (url) => {
    if (!url) return fallback
    if (url.startsWith('/https://') || url.startsWith('/http://')) return url.slice(1)
    if (url.startsWith('http')) return url
    if (!url.startsWith('/')) return `/${url}`
    return url
  }

  const imgList = product?.images?.length
    ? product.images
    : product?.image
    ? [product.image]
    : []

  const imgSrc = imgList.length > 0 ? normalizeUrl(imgList[current]) : fallback

  if (!product) {
    return <div className={`w-full ${heightMobile} ${heightTablet} ${heightDesktop} bg-gray-200 animate-pulse rounded-3xl shadow-lg`} />
  }

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

      {/* Low Stock Overlay */}
      {showOutOfStockOverlay && inStock && stockCount <= 5 && (
        <div className="absolute inset-0 bg-black/20 rounded-3xl z-10 pointer-events-none" />
      )}

      {/* Image */}
      <div className={`relative w-full ${heightMobile} ${heightTablet} ${heightDesktop} overflow-hidden rounded-3xl shadow-lg ${!inStock ? 'opacity-80' : ''}`}>
        <img
          key={imgSrc}
          src={imgSrc}
          alt={product.title || 'Product'}
          onLoad={() => setLoaded(true)}
          onError={(e) => (e.currentTarget.src = fallback)}
          className={`absolute w-full h-full ${fit} object-top rounded-3xl transition-all duration-700 ease-in-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${!inStock ? 'grayscale-20' : ''}`}
        />
      </div>

      {/* Stock Badge */}
      {showStockBadge && (
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStockBadgeColor()} z-20`}>
          {getStockBadgeText()}
        </div>
      )}
    </div>
  )
}
