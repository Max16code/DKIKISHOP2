'use client'
import { useState, useEffect } from 'react'

export default function ProductImage({
  product,
  heightMobile = 'h-40',       // mobile default ~160px
  heightTablet = 'sm:h-48',     // tablet default ~192px
  heightDesktop = 'md:h-56',    // desktop default ~224px
  fit = 'object-contain',
  fallback = '/images/fallback.jpg',
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
    <div
      className={`relative w-full ${heightMobile} ${heightTablet} ${heightDesktop} overflow-hidden rounded-3xl shadow-lg`}
    >
      <img
        key={imgSrc}
        src={imgSrc}
        alt={product.title || 'Product'}
        onLoad={() => setLoaded(true)}
        onError={(e) => (e.currentTarget.src = fallback)}
        className={`absolute w-full h-full ${fit} object-top rounded-3xl transition-all duration-700 ease-in-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </div>
  )
}
