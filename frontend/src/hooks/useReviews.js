// File: frontend/src/hooks/useReviews.js
// [MỚI] React Query hook cho Reviews
import { useQuery } from '@tanstack/react-query';
import { getItemReviews } from '../services/reviewService.js';

/**
 * Hook lấy reviews của 1 item
 * @param {string} itemId 
 * @param {object} options - { page, limit }
 */
export function useItemReviews(itemId, options = {}) {
    const { page = 1, limit = 5 } = options;

    return useQuery({
        queryKey: ['reviews', itemId, { page, limit }],
        queryFn: async () => {
            const response = await getItemReviews(itemId, { page, limit });
            return response.data;
        },
        enabled: !!itemId,
        // Cache 3 phút
        staleTime: 3 * 60 * 1000,
    });
}
