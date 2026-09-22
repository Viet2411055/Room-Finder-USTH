import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SearchState, FilterState } from '../types';

interface SearchContextType {
  search: SearchState;
  filters: FilterState;
  setDestination: (dest: string) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: { adults: number; children: number; infants: number }) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  activeCityTab: string;
  setActiveCityTab: (city: string) => void;
}

const defaultSearch: SearchState = {
  destination: 'Tất cả',
  checkIn: '',
  checkOut: '',
  guests: { adults: 1, children: 0, infants: 0 },
};

const defaultFilters: FilterState = {
  minPrice: 0,
  maxPrice: 10000000,
  roomTypes: [],
  amenities: [],
  minRating: 0,
  superhostOnly: false,
  bedrooms: 0,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [search, setSearch] = useState<SearchState>(defaultSearch);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeCityTab, setActiveCityTab] = useState('Tất cả');

  const setDestination = useCallback((dest: string) => {
    setSearch(prev => ({ ...prev, destination: dest }));
  }, []);

  const setDates = useCallback((checkIn: string, checkOut: string) => {
    setSearch(prev => ({ ...prev, checkIn, checkOut }));
  }, []);

  const setGuests = useCallback((guests: { adults: number; children: number; infants: number }) => {
    setSearch(prev => ({ ...prev, guests }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const value = useMemo(() => ({
    search,
    filters,
    setDestination,
    setDates,
    setGuests,
    setFilters,
    resetFilters,
    isSearchModalOpen,
    setIsSearchModalOpen,
    activeCityTab,
    setActiveCityTab,
  }), [activeCityTab, filters, isSearchModalOpen, resetFilters, search, setDates, setDestination, setGuests]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
