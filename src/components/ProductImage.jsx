// 

// deepseek/////
'use client'
import { useState, useEffect } from 'react'

export default function ProductImage({
  product,
  heightMobile = 'h-40',       // mobile default ~160px
  heightTablet = 'sm:h-48',     // tablet default ~192px
  heightDesktop = 'md:h-56',    // desktop default ~224px
  fit = 'object-contain',
  fallback = '/images/fallback.jpg',
  showStockBadge = true,        // NEW: Control stock badge visibility
  showOutOfStockOverlay = true, // NEW: Control out-of-stock overlay
}) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!product || !product.images) return

    if (product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrent(prev => (prev === 0 ? 1 : 0))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [product])

  // NEW: Calculate stock status
  const isAvailable = product?.isAvailable !== false;
  const stockCount = product?.stock || product?.quantity || 0;
  const inStock = isAvailable && stockCount > 0;
  
  // NEW: Stock badge text
  const getStockBadgeText = () => {
    if (!inStock) return 'Out of Stock';
    if (stockCount <= 5) return `Low Stock: ${stockCount}`;
    if (stockCount <= 10) return `${stockCount} left`;
    return 'In Stock';
  };

  // NEW: Stock badge color
  const getStockBadgeColor = () => {
    if (!inStock) return 'bg-red-500/90 text-white';
    if (stockCount <= 5) return 'bg-red-500/90 text-white';
    if (stockCount <= 10) return 'bg-yellow-500/90 text-white';
    return 'bg-green-500/90 text-white';
  };

  const normalizeUrl = (url) => {
    if (!url) return fallback

    // Fix accidentally prefixed Cloudinary URLs
    if (url.startsWith('/https://') || url.startsWith('/http://')) {
      return url.slice(1)
    }

    // Cloudinary or any external URL
    if (url.startsWith('http')) {
      return url
    }

    // Local images without leading slash
    if (!url.startsWith('/')) {
      return `/${url}`
    }

    return url
  }

  const imgSrc =
    product?.images && product.images.length > 0
      ? normalizeUrl(product.images[current])
      : product?.image
      ? normalizeUrl(product.image)
      : fallback

  if (!product) {
    return (
      <div
        className={`w-full ${heightMobile} ${heightTablet} ${heightDesktop} bg-gray-200 animate-pulse rounded-3xl shadow-lg`}
      />
    )
  }

  return (
    <div className="relative">
      {/* NEW: Out of Stock Overlay */}
      {showOutOfStockOverlay && !inStock && (
        <div className="absolute inset-0 bg-black/50 rounded-3xl z-10 flex items-center justify-center">
          <span className="text-white font-bold text-lg bg-red-600/80 px-4 py-2 rounded-full">
            OUT OF STOCK
          </span>
        </div>
      )}
      
      {/* NEW: Low Stock Overlay */}
      {showOutOfStockOverlay && inStock && stockCount <= 5 && (
        <div className="absolute inset-0 bg-black/20 rounded-3xl z-10 pointer-events-none" />
      )}

      <div
        className={`relative w-full ${heightMobile} ${heightTablet} ${heightDesktop} overflow-hidden rounded-3xl shadow-lg ${
          !inStock ? 'opacity-80' : ''
        }`}
      >
        <img
          key={imgSrc}
          src={imgSrc}
          alt={product.title || 'Product'}
          onLoad={() => setLoaded(true)}
          onError={(e) => (e.currentTarget.src = fallback)}
          className={`absolute w-full h-full ${fit} object-top rounded-3xl transition-all duration-700 ease-in-out ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${!inStock ? 'grayscale-20' : ''}`}
        />
      </div>

      {/* NEW: Stock Status Badge */}
      {showStockBadge && (
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStockBadgeColor()} z-20`}>
          {getStockBadgeText()}
        </div>
      )}
    </div>
  )
}