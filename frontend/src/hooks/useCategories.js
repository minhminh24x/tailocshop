// File: frontend/src/hooks/useCategories.js
// [MỚI] React Query hook cho Categories - data ít thay đổi, cache lâu
import { useQuery } from '@tanstack/react-query';
import { getAllCategoriesAdmin } from '../services/adminCategoryService.js';

/**
 * Hook lấy danh sách categories
 * Categories ít thay đổi nên cache 10 phút
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await getAllCategoriesAdmin();
            return response.data;
        },
        // Cache 10 phút (categories ít thay đổi)
        staleTime: 10 * 60 * 1000,
        // Giữ cache 1 giờ
        gcTime: 60 * 60 * 1000,
    });
}
