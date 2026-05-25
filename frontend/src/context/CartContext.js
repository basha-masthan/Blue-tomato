import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('user_cart');
      const storedRestaurant = await AsyncStorage.getItem('user_cart_restaurant');
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedRestaurant) setRestaurantId(storedRestaurant);
    } catch {
      // ignore
    }
  };

  const saveCart = async (newCart, newRestaurantId) => {
    setCart(newCart);
    setRestaurantId(newRestaurantId);
    await AsyncStorage.setItem('user_cart', JSON.stringify(newCart));
    if (newRestaurantId) {
      await AsyncStorage.setItem('user_cart_restaurant', newRestaurantId);
    } else {
      await AsyncStorage.removeItem('user_cart_restaurant');
    }
  };

  const addItem = async (item, resId) => {
    let newCart = [...cart];
    // Check if adding from a different restaurant
    if (restaurantId && restaurantId !== resId && newCart.length > 0) {
      // Typically we'd prompt the user, but for simplicity we clear cart
      newCart = [];
    }

    const existingIndex = newCart.findIndex(i => i.menuItemId === item.menuItemId);
    if (existingIndex >= 0) {
      newCart[existingIndex].quantity += 1;
      newCart[existingIndex].subtotal = newCart[existingIndex].quantity * newCart[existingIndex].price;
    } else {
      newCart.push({ ...item, quantity: 1, subtotal: item.price });
    }

    await saveCart(newCart, resId);
  };

  const removeItem = async (itemId) => {
    let newCart = [...cart];
    const existingIndex = newCart.findIndex(i => i.menuItemId === itemId);
    if (existingIndex >= 0) {
      if (newCart[existingIndex].quantity > 1) {
        newCart[existingIndex].quantity -= 1;
        newCart[existingIndex].subtotal = newCart[existingIndex].quantity * newCart[existingIndex].price;
      } else {
        newCart.splice(existingIndex, 1);
      }
    }
    await saveCart(newCart, newCart.length > 0 ? restaurantId : null);
  };

  const clearCart = async () => {
    await saveCart([], null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, restaurantId,
      addItem, removeItem, clearCart,
      cartTotal, cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
