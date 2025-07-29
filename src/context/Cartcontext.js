'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('dkikishop-cart')
    if (saved) setCartItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('dkikishop-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = async (item) => {
    try {
      // 🔍 Check latest stock from backend
      const res = await fetch(`/api/product/${item._id}`)
      const product = await res.json()

      if (!product || product.quantity === 0) {
        alert('🚫 This product is out of stock!')
        return
      }

      const exists = cartItems.find(
        (cartItem) => cartItem._id === item._id && cartItem.size === item.size
      )

      if (exists) {
        setCartItems((prev) =>
          prev.map((cartItem) =>
            cartItem._id === item._id && cartItem.size === item.size
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        )
      } else {
        setCartItems((prev) => [...prev, item])
      }
    } catch (err) {
      console.error('❌ Error checking stock:', err)
      alert('Something went wrong. Please try again.')
    }
  }

  const removeFromCart = (idToRemove, sizeToRemove) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item._id === idToRemove && item.size === sizeToRemove)
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('dkikishop-cart') // ✅ Clear saved cart too
  }

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
