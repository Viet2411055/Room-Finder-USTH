import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  isSaved: (listingId: string) => boolean;
  toggle: (listingId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    if (!currentUser) {
      setSavedIds(new Set());
      return () => { active = false; };
    }
    api.wishlist()
      .then(items => { if (active) setSavedIds(new Set(items.map(item => item.id))); })
      .catch(() => { if (active) setSavedIds(new Set()); });
    return () => { active = false; };
  }, [currentUser?.id]);

  const isSaved = useCallback((listingId: string) => savedIds.has(listingId), [savedIds]);
  const toggle = useCallback(async (listingId: string) => {
    const wasSaved = savedIds.has(listingId);
    setSavedIds(previous => {
      const next = new Set(previous);
      if (wasSaved) next.delete(listingId); else next.add(listingId);
      return next;
    });
    try {
      if (wasSaved) await api.removeWishlist(listingId); else await api.addWishlist(listingId);
    } catch (error) {
      setSavedIds(previous => {
        const next = new Set(previous);
        if (wasSaved) next.add(listingId); else next.delete(listingId);
        return next;
      });
      throw error;
    }
  }, [savedIds]);

  const value = useMemo(() => ({ isSaved, toggle }), [isSaved, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
