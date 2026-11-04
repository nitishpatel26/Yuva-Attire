import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isVip } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('yuva_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('yuva_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('yuva_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('yuva_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('yuva_coupon');
    }
  }, [coupon]);

  const addToCart = (product, size = 'Standard', color = 'Default', quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      const price = product.discountPrice || product.price;

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * price;
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          image: product.images?.[0] || '',
          category: product.category,
          sku: product.sku,
          size,
          color,
          price,
          originalPrice: product.price,
          quantity,
          subtotal: price * quantity
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId, size, color, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return {
            ...item,
            quantity: newQty,
            subtotal: item.price * newQty
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    try {
      const subtotalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotalAmount })
      });
      const data = await res.json();
      if (data.success) {
        setCoupon(data.coupon);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const couponDiscount = coupon ? coupon.discount : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);

  // VIP Club Members get extra 15% discount
  const vipDiscount = isVip ? Math.round(subtotalAfterCoupon * 0.15) : 0;

  // Shipping is free if VIP or subtotal >= 999, else 99
  const shippingFee = cartItems.length === 0 ? 0 : (isVip || subtotal >= 999 ? 0 : 99);
  const totalAmount = Math.max(0, Math.round(subtotalAfterCoupon - vipDiscount + shippingFee));

  const totalSavings =
    cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0) +
    couponDiscount +
    vipDiscount;

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    totalItemsCount,
    subtotal,
    couponDiscount,
    vipDiscount,
    shippingFee,
    totalAmount,
    totalSavings
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
