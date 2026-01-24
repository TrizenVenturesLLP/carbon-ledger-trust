import apiClient from './client';

export interface Transaction {
  _id: string;
  transactionId: string;
  type: 'issued' | 'transferred' | 'retired';
  fromUserId?: {
    _id: string;
    email: string;
    companyName?: string;
  };
  toUserId?: {
    _id: string;
    email: string;
    companyName?: string;
  };
  creditId: {
    _id: string;
    creditId: string;
    amount: number;
  };
  amount: number;
  blockchainTxHash?: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  retirementReason?: string;
  createdAt: string;
  confirmedAt?: string;
}

export const transactionsApi = {
  getTransactions: async (type?: string): Promise<Transaction[]> => {
    const params = type ? { type } : {};
    const response = await apiClient.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },
};
