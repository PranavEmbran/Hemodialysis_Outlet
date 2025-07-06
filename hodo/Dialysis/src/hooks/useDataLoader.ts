import { useState, useEffect, useCallback } from 'react';
import { loadData } from '../utils/loadData';

interface UseDataLoaderOptions {
    resource: string;
    cacheKey?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface UseDataLoaderReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    clearCache: () => void;
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const loadDataWithCache = async (resource: string, cacheKey?: string): Promise<any[]> => {
    const key = cacheKey || `dialysis_${resource}`;
    const now = Date.now();

    // Check cache first
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log(`Using cached data for ${resource}`);
        return cached.data;
    }

    // Load fresh data
    const data = await loadData(resource);

    // Cache the result
    cache.set(key, { data, timestamp: now });

    // Also save to localStorage as backup
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.warn('Failed to save to localStorage:', err);
    }

    return data;
};

const clearCache = (resource: string, cacheKey?: string) => {
    const key = cacheKey || `dialysis_${resource}`;
    cache.delete(key);
    try {
        localStorage.removeItem(key);
    } catch (err) {
        console.warn('Failed to clear localStorage:', err);
    }
};

/**
 * Custom hook for loading data with localStorage caching to prevent UI flickering
 * 
 * @param options - Configuration options for data loading
 * @returns Object containing data, loading state, error, and utility functions
 */
export function useDataLoader<T = any>(options: UseDataLoaderOptions): UseDataLoaderReturn<T> {
    const { resource, cacheKey, autoRefresh = false, refreshInterval = 30000 } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data from cache first, then fetch fresh data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Load data with caching
            const freshData = await loadDataWithCache(resource, cacheKey);
            setData(freshData);
        } catch (err) {
            console.error(`Error loading ${resource}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to load data');

            // Try to load from localStorage as fallback
            try {
                const fallbackKey = cacheKey || `dialysis_${resource}`;
                const cached = localStorage.getItem(fallbackKey);
                if (cached) {
                    const fallbackData = JSON.parse(cached);
                    setData(fallbackData);
                    setError(null);
                }
            } catch (fallbackErr) {
                console.error('Fallback loading failed:', fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    }, [resource, cacheKey]);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadData();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, loadData]);

    // Clear cache function
    const clearDataCache = useCallback(() => {
        clearCache(resource);
    }, [resource]);

    return {
        data,
        loading,
        error,
        refresh: loadData,
        clearCache: clearDataCache,
    };
}

/**
 * Hook for loading a single item by ID
 */
export function useDataLoaderById<T = any>(
    resource: string,
    id: string | number | null,
    cacheKey?: string
) {
    const [item, setItem] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setItem(null);
            setLoading(false);
            return;
        }

        const loadItem = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load all data and find the specific item
                const allData = await loadDataWithCache(resource, cacheKey);
                const foundItem = allData.find((item: any) => item.id === id || item.id === String(id));

                if (foundItem) {
                    setItem(foundItem);
                } else {
                    setError(`Item with ID ${id} not found`);
                }
            } catch (err) {
                console.error(`Error loading ${resource} item ${id}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load item');
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [resource, id, cacheKey]);

    return { item, loading, error };
}

/**
 * Hook for loading multiple resources at once
 */
export function useMultiDataLoader<T extends Record<string, any[]>>(
    resources: string[],
    cacheKeys?: Record<string, string>
) {
    const [data, setData] = useState<T>({} as T);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                const promises = resources.map(async (resource) => {
                    const cacheKey = cacheKeys?.[resource];
                    const resourceData = await loadDataWithCache(resource, cacheKey);
                    return { resource, data: resourceData };
                });

                const results = await Promise.all(promises);
                const combinedData = results.reduce((acc, { resource, data }) => {
                    (acc as any)[resource] = data;
                    return acc;
                }, {} as T);

                setData(combinedData);
            } catch (err) {
                console.error('Error loading multiple resources:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [resources, cacheKeys]);

    return { data, loading, error };
} 