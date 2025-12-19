// File: frontend/src/hooks/useItems.js
// [MỚI] React Query hooks cho Items - giảm API calls đáng kể
import { useQuery } from '@tanstack/react-query';
import { getAllItems, getSingleItem } from '../services/itemService.js';

/**
 * Hook lấy danh sách items với caching
 * @param {object} filters - { categoryId, page, limit, search }
 */
export function useItems(filters = {}) {
    const { categoryId, page = 1, limit = 12, search = '' } = filters;

    return useQuery({
        // Key unique dựa trên filters
        queryKey: ['items', { categoryId, page, limit, search }],
        queryFn: async () => {
            const response = await getAllItems({ categoryId, page, limit, search });
            return response.data;
        },
        // Giữ data cũ khi đang fetch (smooth UX)
        placeholderData: (previousData) => previousData,
        // Cache 5 phút
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook lấy chi tiết 1 item
 * @param {string} slug 
 */
export function useItem(slug) {
    return useQuery({
        queryKey: ['item', slug],
        queryFn: async () => {
            const response = await getSingleItem(slug);
            return response.data;
        },
        // Chỉ fetch khi có slug
        enabled: !!slug,
        // Cache 5 phút
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook prefetch item (cho hover preview)
 */
export function usePrefetchItem() {
    const { queryClient } = require('@tanstack/react-query');

    return (slug) => {
        queryClient.prefetchQuery({
            queryKey: ['item', slug],
            queryFn: async () => {
                const response = await getSingleItem(slug);
                return response.data;
            },
            staleTime: 5 * 60 * 1000,
        });
    };
}
