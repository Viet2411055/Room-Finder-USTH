import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchProvider, useSearch } from './SearchContext';

describe('SearchProvider', () => {
  it('keeps destination actions stable across a search-state update', async () => {
    const observed: Array<ReturnType<typeof useSearch>['setDestination']> = [];

    function Probe() {
      const { search, setDestination } = useSearch();
      observed.push(setDestination);
      useEffect(() => {
        if (search.destination === 'Tất cả') setDestination('Đà Nẵng');
      }, [search.destination, setDestination]);
      return null;
    }

    render(<SearchProvider><Probe /></SearchProvider>);
    await waitFor(() => expect(observed.length).toBeGreaterThan(1));
    expect(new Set(observed).size).toBe(1);
  });
});
