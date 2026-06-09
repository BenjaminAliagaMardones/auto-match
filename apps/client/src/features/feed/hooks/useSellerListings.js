import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

export function useSellerListings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await apiClient.get('listings/me').json();
        if (res && res.items) {
          setListings(res.items);
        }
      } catch (error) {
        console.error("Error fetching listings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  return {
    listings,
    isLoading,
    activeCount: listings.filter(l => l.status === 'active').length,
    pausedCount: listings.filter(l => l.status === 'paused').length,
    soldCount: listings.filter(l => l.status === 'sold').length,
    totalCount: listings.length
  };
}
