import apiClient from './client';

export interface Document {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface EmissionReport {
  _id: string;
  reportId: string;
  companyId: string;
  title: string;
  type: 'quarterly' | 'project' | 'annual';
  description: string;
  methodology: string;
  baselineEmissions: number;
  reportedEmissions: number;
  estimatedCredits: number;
  issuedCredits?: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  documents: Document[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitReportData {
  title: string;
  type: 'quarterly' | 'project' | 'annual';
  description: string;
  methodology: string;
  baselineEmissions: number;
  reportedEmissions: number;
  estimatedCredits: number;
  documents?: File[];
}

export const reportsApi = {
  submitReport: async (data: SubmitReportData): Promise<EmissionReport> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('methodology', data.methodology);
    formData.append('baselineEmissions', data.baselineEmissions.toString());
    formData.append('reportedEmissions', data.reportedEmissions.toString());
    formData.append('estimatedCredits', data.estimatedCredits.toString());

    if (data.documents) {
      data.documents.forEach((file) => {
        formData.append('documents', file);
      });
    }

    const response = await apiClient.post<EmissionReport>('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getReports: async (): Promise<EmissionReport[]> => {
    const response = await apiClient.get<EmissionReport[]>('/reports');
    return response.data;
  },

  getReportById: async (id: string): Promise<EmissionReport> => {
    const response = await apiClient.get<EmissionReport>(`/reports/${id}`);
    return response.data;
  },

  uploadDocuments: async (id: string, files: File[]): Promise<EmissionReport> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await apiClient.post<EmissionReport>(`/reports/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
