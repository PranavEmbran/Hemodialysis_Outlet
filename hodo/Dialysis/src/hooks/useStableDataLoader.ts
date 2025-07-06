import { useState, useEffect, useCallback } from 'react';
import { loadData } from '../utils/loadData';

interface UseStableDataLoaderOptions {
    resource: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface UseStableDataLoaderReturn<T> {
    data: T[] | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Stable data loading hook that loads data only once and prevents flickering
 * 
 * @param options - Configuration options for data loading
 * @returns Object containing data, loading state, error, and refresh function
 */
export function useStableDataLoader<T = any>(options: UseStableDataLoaderOptions): UseStableDataLoaderReturn<T> {
    const { resource, autoRefresh = false, refreshInterval = 30000 } = options;

    // Use null as initial state to prevent rendering until data is loaded
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data function - only fetches from the correct source based on VITE_DATA_MODE
    const loadDataFromSource = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`useStableDataLoader: Loading ${resource}`);
            const freshData = await loadData(resource);
            console.log(`useStableDataLoader: Loaded ${freshData.length} ${resource}`);

            setData(freshData);
        } catch (err) {
            console.error(`useStableDataLoader: Error loading ${resource}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
            setData(null); // Ensure data is null on error
        } finally {
            setLoading(false);
        }
    }, [resource]);

    // Initial load - only once on mount
    useEffect(() => {
        loadDataFromSource();
    }, [loadDataFromSource]);

    // Auto-refresh functionality (optional)
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadDataFromSource();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, loadDataFromSource]);

    return {
        data,
        loading,
        error,
        refresh: loadDataFromSource,
    };
}

/**
 * Hook for loading a single item by ID
 */
export function useStableDataLoaderById<T = any>(
    resource: string,
    id: string | number | null
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
                const allData = await loadData(resource);
                const foundItem = allData.find((item: any) => item.id === id || item.id === String(id));

                if (foundItem) {
                    setItem(foundItem);
                } else {
                    setError(`Item with ID ${id} not found`);
                    setItem(null);
                }
            } catch (err) {
                console.error(`Error loading ${resource} item ${id}:`, err);
                setError(err instanceof Error ? err.message : 'Failed to load item');
                setItem(null);
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [resource, id]);

    return { item, loading, error };
}

/**
 * Hook for loading multiple resources at once
 */
export function useStableMultiDataLoader<T extends Record<string, any[]>>(
    resources: string[]
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                const promises = resources.map(async (resource) => {
                    const resourceData = await loadData(resource);
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
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [resources]);

    return { data, loading, error };
} 