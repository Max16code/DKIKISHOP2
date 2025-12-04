'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the CartContext
const CartContext = createContext();

// 2. Export the hook to access cart
export const useCart = () => useContext(CartContext);

// 3. CartProvider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage (optional but great for persistence)
  useEffect(() => {
    const storedCart = localStorage.getItem('dkikishop-cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dkikishop-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Fixed addToCart
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item._id === product._id && item.size === product.size
      );
      if (existing) {
        return prev.map((item) =>
          item._id === product._id && item.size === product.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          { ...product, image: product.images?.[0] || '', quantity: 1 },
        ];
      }
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item._id === productId && item.size === size)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (productId, size, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
