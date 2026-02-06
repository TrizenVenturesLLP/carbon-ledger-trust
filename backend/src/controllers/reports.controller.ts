import { Response } from 'express';
import { EmissionReport } from '../models/EmissionReport';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { deleteFile } from '../services/file.service';
import { registerReport } from '../services/blockchain.service';

export const submitReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      type,
      description,
      methodology,
      baselineEmissions,
      reportedEmissions,
      estimatedCredits,
    } = req.body;

    // Validate required fields
    if (!title || !type || !description || !methodology || !baselineEmissions || !reportedEmissions || !estimatedCredits) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Get uploaded files
    const files = (req.files as Express.Multer.File[]) || [];
    const documents = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    }));

    // Get company wallet address
    const company = await User.findById(req.user?.id);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Create report
    const report = await EmissionReport.create({
      companyId: req.user?.id,
      title,
      type,
      description,
      methodology,
      baselineEmissions: parseFloat(baselineEmissions),
      reportedEmissions: parseFloat(reportedEmissions),
      estimatedCredits: parseFloat(estimatedCredits),
      documents,
      status: 'pending',
    });

    // Register report on blockchain (optional - only if wallet is linked)
    if (company.walletAddress) {
      try {
        // Convert reportId to numeric ID for blockchain (use last 8 chars of MongoDB _id as hex)
        const numericId = parseInt(report._id.toString().slice(-8), 16) || Date.now() % 1000000000;
        const registryId = await registerReport(numericId, company.walletAddress);
        report.blockchainReportId = registryId;
        await report.save();
      } catch (blockchainError: any) {
        // Log error but don't fail report submission
        console.warn('Failed to register report on blockchain:', blockchainError.message);
        // Report is still created successfully
      }
    }

    res.status(201).json(report);
  } catch (error: any) {
    // Clean up uploaded files on error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        deleteFile(file.path);
      });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};

    // Companies can only see their own reports
    if (req.user?.role === 'company') {
      query.companyId = req.user.id;
    }
    // Regulators can see all reports
    // No filter needed

    const reports = await EmissionReport.find(query)
      .populate('companyId', 'email companyName')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await EmissionReport.findById(id)
      .populate('companyId', 'email companyName')
      .populate('reviewedBy', 'email');

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    // Companies can only see their own reports
    if (req.user?.role === 'company' && report.companyId.toString() !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const report = await EmissionReport.findById(id);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    // Check ownership
    if (req.user?.role === 'company' && report.companyId.toString() !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Check if report can be modified
    if (report.status !== 'pending') {
      res.status(400).json({ error: 'Cannot modify report that is not pending' });
      return;
    }

    // Add new documents
    const newDocuments = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    }));

    report.documents.push(...newDocuments);
    await report.save();

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
