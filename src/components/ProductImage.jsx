'use client'
import { useState, useEffect } from 'react'

export default function ProductImage({
  product,
  height = 'h-[650px]',
  fit = 'object-contain',
  fallback = '/images/fallback.jpg', // optional override
}) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false) // fade-in animation

  // ⛔ Prevent crash if product or product.images is undefined
  useEffect(() => {
    if (!product || !product.images) return

    if (product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrent(prev => (prev === 0 ? 1 : 0))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [product])

  // 🧠 Normalize URL: remove accidental leading slash for full URLs
  const normalizeUrl = (url) => {
    if (!url) return fallback
    if (url.startsWith('/https://') || url.startsWith('/http://')) {
      return url.slice(1) // remove the extra '/'
    }
    return url
  }

  const imgSrc =
    product?.images && product.images.length > 0
      ? normalizeUrl(product.images[current])
      : product?.image
      ? normalizeUrl(product.image)
      : fallback

  // 🧱 Skeleton loader while product data hasn’t arrived yet
  if (!product) {
    return (
      <div
        className={`w-full ${height} bg-gray-200 animate-pulse rounded-3xl shadow-lg`}
      />
    )
  }

  return (
    <div
      className={`relative w-full ${height} overflow-hidden rounded-3xl shadow-lg`}
    >
      <img
        key={imgSrc}
        src={imgSrc}
        alt={product.title || 'Product'}
        onLoad={() => setLoaded(true)}
        onError={(e) => (e.currentTarget.src = fallback)} // fallback if broken
        className={`absolute w-full h-full ${fit} object-top rounded-3xl transition-all duration-700 ease-in-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </div>
  )
}
