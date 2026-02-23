'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('dkikishop-cart');
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('dkikishop-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product.shopId && process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: Product ${product.title || product._id} is missing shopId. ` +
        'Orders may use fallback shopId.'
      );
    }

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
        const safeImage =
          product.images?.[0] || product.image || '/images/placeholder.png';

        return [
          ...prev,
          {
            productId: product._id,
            title: product.title,
            price: product.price,
            size: product.size || null,
            image: safeImage,
            quantity: 1,
            shopId: product.shopId || null,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, size) =>
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );

  const clearCart = () => setCartItems([]);

  const updateQuantity = (productId, size, quantity) => {
    setCartItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      );
      return [...updatedItems];
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,  // now included correctly
      }}
    >
      {children}
    </CartContext.Provider>
  );
};