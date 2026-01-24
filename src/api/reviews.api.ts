import apiClient from './client';
import { EmissionReport } from './reports.api';

export interface ApproveReportData {
  issuedCredits?: number;
  notes?: string;
}

export interface RejectReportData {
  rejectionReason: string;
  notes?: string;
}

export const reviewsApi = {
  getPendingReviews: async (): Promise<EmissionReport[]> => {
    const response = await apiClient.get<EmissionReport[]>('/reviews/pending');
    return response.data;
  },

  getReviewById: async (id: string): Promise<EmissionReport> => {
    const response = await apiClient.get<EmissionReport>(`/reviews/${id}`);
    return response.data;
  },

  approveReport: async (id: string, data: ApproveReportData): Promise<any> => {
    const response = await apiClient.post(`/reviews/${id}/approve`, data);
    return response.data;
  },

  rejectReport: async (id: string, data: RejectReportData): Promise<any> => {
    const response = await apiClient.post(`/reviews/${id}/reject`, data);
    return response.data;
  },

  getApprovedReports: async (): Promise<EmissionReport[]> => {
    const response = await apiClient.get<EmissionReport[]>('/reviews/approved');
    return response.data;
  },
};
