import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('yuva_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync to backend if authenticated, or localStorage if guest
  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      localStorage.setItem('yuva_wishlist', JSON.stringify(wishlistIds));
    }
  }, [token]);

  const fetchWishlist = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlistIds(data.productIds || []);
        setWishlistProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to fetch wishlist:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    const productId = typeof product === 'string' ? product : product.id;

    if (token) {
      try {
        const res = await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
        const data = await res.json();
        if (data.success) {
          setWishlistIds(data.productIds);
          fetchWishlist();
          return data.isWishlisted;
        }
      } catch (e) {
        console.error('Error toggling wishlist:', e);
      }
    }

    // Guest fallback
    let updated;
    const exists = wishlistIds.includes(productId);
    if (exists) {
      updated = wishlistIds.filter((id) => id !== productId);
    } else {
      updated = [...wishlistIds, productId];
    }
    setWishlistIds(updated);
    localStorage.setItem('yuva_wishlist', JSON.stringify(updated));
    return !exists;
  };

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  const value = {
    wishlistIds,
    wishlistProducts,
    wishlistCount: wishlistIds.length,
    toggleWishlist,
    isWishlisted,
    fetchWishlist,
    loading
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
