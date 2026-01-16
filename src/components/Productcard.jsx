'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProductImage from './ProductImage'
import { useCart } from '@/context/Cartcontext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('')
  
  // Check product availability
  const isAvailable = product?.isAvailable !== false;
  const stockCount = product?.stock || product?.quantity || 0;
  const inStock = isAvailable && stockCount > 0;
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!inStock) {
      alert('This product is out of stock!');
      return;
    }
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size first');
      return;
    }
    
    addToCart({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || product.image,
      size: selectedSize,
      quantity: 1,
      stock: stockCount // Pass stock info for validation
    });
  };

  // Get price display
  const priceDisplay = `₦${product.price?.toLocaleString()}`;

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Product Image */}
      <Link href={`/product/${product._id}`}>
        <ProductImage 
          product={product}
          showStockBadge={true}
          showOutOfStockOverlay={true}
        />
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-800 text-lg mb-2 hover:text-green-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-700">
            {priceDisplay}
          </span>
          
          {/* Stock Indicator (if not showing badge on image) */}
          {!inStock && (
            <span className="text-sm text-red-600 font-medium">
              Out of Stock
            </span>
          )}
          {inStock && stockCount <= 5 && (
            <span className="text-sm text-orange-600 font-medium">
              Only {stockCount} left
            </span>
          )}
        </div>

        {/* Size Selector (if product has sizes) */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    selectedSize === size
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-green-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            inStock
              ? 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {inStock ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>

        {/* Quick View (Optional) */}
        {inStock && (
          <button className="w-full mt-2 py-2 px-4 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
            Quick View
          </button>
        )}
      </div>

      {/* Category Tag */}
      {product.category && (
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      )}
    </div>
  )
}