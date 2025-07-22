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

  const addToCart = (item) => {
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
  }

  const removeFromCart = (id, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item._id === id && item.size === size))
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
