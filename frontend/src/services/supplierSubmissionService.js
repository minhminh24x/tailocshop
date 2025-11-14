// File: frontend/src/services/supplierSubmissionService.js
import apiClient from './apiClient';

// Lấy danh sách phiếu nhập kho
export const getSubmissions = async (status = '') => {
  try {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    const { data } = await apiClient.get('/supplier-submissions', { params });
    return data;
  } catch (error) {
    throw error.response.data;
  }
};

// Lấy chi tiết 1 phiếu
export const getSubmissionById = async (id) => {
  try {
    const { data } = await apiClient.get(`/supplier-submissions/${id}`);
    return data;
  } catch (error) {
    throw error.response.data;
  }
};

// Duyệt phiếu
export const approveSubmission = async (id, approvalData) => {
  try {
    const { data } = await apiClient.put(
      `/supplier-submissions/${id}/approve`,
      approvalData
    );
    return data;
  } catch (error) {
    throw error.response.data;
  }
};

// Từ chối phiếu
export const rejectSubmission = async (id, rejectData) => {
  try {
    const { data } = await apiClient.put(
      `/supplier-submissions/${id}/reject`,
      rejectData
    );
    return data;
  } catch (error) {
    throw error.response.data;
  }
};