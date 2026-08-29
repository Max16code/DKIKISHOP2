'use client'

import { useState, useEffect } from 'react'

export default function CartItemQuantity({ item, updateQuantity }) {
  console.log('Received updateQuantity type:', typeof updateQuantity);

  const [localQty, setLocalQty] = useState(item?.quantity || 1);

  // Effect 1: Sync global → local
  useEffect(() => {
    console.log('Effect 1: global qty changed to', item?.quantity);
    setLocalQty(item?.quantity || 1);
  }, [item?.quantity]);

  // Effect 2: Sync local → global
  useEffect(() => {
    console.log('Effect 2 triggered - localQty is now:', localQty);
    
    if (localQty !== item?.quantity) {
      if (typeof updateQuantity === 'function') {
        console.log('ACTUALLY calling updateQuantity with new qty:', localQty);
        updateQuantity(item._id, item.size, localQty);
      } else {
        console.error('updateQuantity is not a function in CartItemQuantity');
      }
    } else {
      console.log('Skipped update - localQty matches global');
    }
  }, [localQty]);

  return (
    <div className="mt-3">
      {/* Item subtotal - updates live with localQty */}
      <p className="text-green-400 font-bold mb-2">
        ₦{(item.price * localQty).toLocaleString()}
      </p>

      {/* Quantity controls - same as product detail */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            console.log('Minus button clicked - current localQty:', localQty); // Log 3
            setLocalQty(prev => Math.max(1, prev - 1));
          }}
          disabled={localQty <= 1}
          className={`
            w-10 h-10 flex items-center justify-center 
            bg-white/10 border border-white/20 rounded-full 
            text-white text-xl font-bold 
            hover:bg-yellow-500/20 hover:border-yellow-400/50 
            disabled:opacity-40 disabled:cursor-not-allowed 
            transition-all duration-200
          `}
        >
          -
        </button>

        <div className="
          w-16 h-10 flex items-center justify-center 
          bg-black/50 border border-white/20 rounded-lg 
          text-white font-semibold text-lg
        ">
          {localQty}
        </div>

        <button
          type="button"
          onClick={() => {
            console.log('Plus button clicked - current localQty:', localQty); // Log 4
            setLocalQty(prev => prev + 1);
          }}
          disabled={localQty >= 999}
          className={`
            w-10 h-10 flex items-center justify-center 
            bg-white/10 border border-white/20 rounded-full 
            text-white text-xl font-bold 
            hover:bg-yellow-500/20 hover:border-yellow-400/50 
            transition-all duration-200
          `}
        >
          +
        </button>
      </div>
    </div>
  )
}