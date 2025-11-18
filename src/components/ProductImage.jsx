'use client'
import { useState, useEffect } from 'react'

export default function ProductImage({
  product,
  height = 'h-[650px]',
  fit = 'object-contain',
}) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false) // for fade-in animation

  // ⛔ Prevent crash if product or product.images is undefined
  useEffect(() => {
    if (!product || !product.images) return

    if (product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev === 0 ? 1 : 0))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [product])

  // 🧠 Fallbacks for image source
  const imgSrc =
    product?.images && product.images.length > 0
      ? product.images[current].startsWith('/')
        ? product.images[current]
        : `/${product.images[current]}`
      : product?.image
      ? product.image.startsWith('/')
        ? product.image
        : `/${product.image}`
      : '/images/fallback.jpg'

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
        className={`absolute w-full h-full ${fit} object-top rounded-3xl transition-all duration-700 ease-in-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </div>
  )
}
