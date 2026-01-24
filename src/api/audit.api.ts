import apiClient from './client';

export interface AuditLog {
  _id: string;
  action: 'approved' | 'rejected' | 'reviewed';
  reportId: {
    _id: string;
    reportId: string;
    title: string;
  };
  companyId: {
    _id: string;
    email: string;
    companyName?: string;
  };
  verifierId: {
    _id: string;
    email: string;
  };
  verifierName: string;
  notes: string;
  creditsIssued?: number;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  createdAt: string;
}

export interface AuditStats {
  total: number;
  approved: number;
  rejected: number;
  reviewed: number;
  creditsIssued: number;
}

export const auditApi = {
  getAuditLogs: async (action?: string, verifierId?: string): Promise<AuditLog[]> => {
    const params: any = {};
    if (action) params.action = action;
    if (verifierId) params.verifierId = verifierId;
    
    const response = await apiClient.get<AuditLog[]>('/audit', { params });
    return response.data;
  },

  getAuditStats: async (): Promise<AuditStats> => {
    const response = await apiClient.get<AuditStats>('/audit/stats');
    return response.data;
  },
};
