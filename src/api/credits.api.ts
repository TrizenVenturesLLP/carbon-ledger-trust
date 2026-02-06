import apiClient from './client';

export interface CarbonCredit {
  _id: string;
  creditId: string;
  reportId: {
    _id: string;
    title: string;
    reportId: string;
  };
  companyId: {
    _id: string;
    email: string;
    companyName?: string;
  };
  amount: number;
  status: 'active' | 'retired' | 'transferred';
  currentOwner: {
    _id: string;
    email: string;
    companyName?: string;
  };
  originalOwner: {
    _id: string;
    email: string;
    companyName?: string;
  };
  retiredAt?: string;
  retirementReason?: string;
  blockchainTxHash?: string;
  tokenId?: number;
  contractAddress?: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  active: number;
  retired: number;
  total: number;
}

interface TransferRecordPayload {
  toWalletAddress: string;
  blockchainTxHash: string;
}

interface RetireRecordPayload {
  retirementReason: string;
  blockchainTxHash: string;
}

export const creditsApi = {
  getCredits: async (status?: string): Promise<CarbonCredit[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<CarbonCredit[]>('/credits', { params });
    return response.data;
  },

  getCreditById: async (id: string): Promise<CarbonCredit> => {
    const response = await apiClient.get<CarbonCredit>(`/credits/${id}`);
    return response.data;
  },

  getWalletBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get<WalletBalance>('/credits/wallet');
    return response.data;
  },

  // Record a transfer that was already executed on-chain via MetaMask
  transferCredit: async (id: string, data: TransferRecordPayload): Promise<any> => {
    const response = await apiClient.post(`/credits/${id}/transfer`, data);
    return response.data;
  },

  // Record a retirement that was already executed on-chain via MetaMask
  retireCredit: async (id: string, data: RetireRecordPayload): Promise<any> => {
    const response = await apiClient.post(`/credits/${id}/retire`, data);
    return response.data;
  },
};
