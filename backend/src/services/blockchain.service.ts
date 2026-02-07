import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Contract ABIs (will be generated after compilation)
let CarbonCreditTokenABI: any[] = [];
let CarbonCreditRegistryABI: any[] = [];

// ESM: get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve artifacts dir: try multiple locations (backend/artifacts)
const getArtifactsDir = (): string => {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'artifacts'),
    path.resolve(process.cwd(), 'artifacts'),
    path.resolve(process.cwd(), 'backend', 'artifacts'),
  ];
  for (const dir of candidates) {
    const contractsDir = path.join(dir, 'contracts', 'CarbonCreditToken.sol', 'CarbonCreditToken.json');
    if (fs.existsSync(contractsDir)) return dir;
  }
  return path.resolve(process.cwd(), 'artifacts');
};

// Load ABIs from compiled contracts
const loadABIs = () => {
  try {
    const base = getArtifactsDir();
    const tokenPath = path.join(base, 'contracts', 'CarbonCreditToken.sol', 'CarbonCreditToken.json');
    const registryPath = path.join(base, 'contracts', 'CarbonCreditRegistry.sol', 'CarbonCreditRegistry.json');

    if (fs.existsSync(tokenPath)) {
      const tokenArtifact = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
      CarbonCreditTokenABI = tokenArtifact.abi;
    } else {
      console.warn('Token ABI not found at', tokenPath);
    }

    if (fs.existsSync(registryPath)) {
      const registryArtifact = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      CarbonCreditRegistryABI = registryArtifact.abi;
    } else {
      console.warn('Registry ABI not found at', registryPath);
    }
  } catch (error) {
    console.warn('Could not load contract ABIs. Make sure contracts are compiled.', error);
  }
};

// Initialize provider and wallet
const getProvider = () => {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
};

const getWallet = () => {
  const privateKey = process.env.REGULATOR_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('REGULATOR_WALLET_PRIVATE_KEY not set in environment variables');
  }
  return new ethers.Wallet(privateKey, getProvider());
};

// Get contract instances
const getTokenContract = () => {
  const contractAddress = process.env.CARBON_CREDIT_TOKEN_ADDRESS;
  if (!contractAddress) {
    throw new Error('CARBON_CREDIT_TOKEN_ADDRESS not set');
  }
  const wallet = getWallet();
  return new ethers.Contract(contractAddress, CarbonCreditTokenABI, wallet);
};

const getRegistryContract = () => {
  const contractAddress = process.env.CARBON_CREDIT_REGISTRY_ADDRESS;
  if (!contractAddress) {
    throw new Error('CARBON_CREDIT_REGISTRY_ADDRESS not set');
  }
  const wallet = getWallet();
  return new ethers.Contract(contractAddress, CarbonCreditRegistryABI, wallet);
};

// Issue credits (mint NFT)
export const issueCredits = async (
  toAddress: string,
  amount: number,
  metadata: string
): Promise<{ txHash: string; tokenId: number }> => {
  try {
    loadABIs();
    const contract = getTokenContract();
    
    const tx = await contract.mintCredit(toAddress, amount, metadata);
    const receipt = await tx.wait();
    
    // Get token ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'CreditIssued';
      } catch {
        return false;
      }
    });
    
    const tokenId = event ? contract.interface.parseLog(event).args.tokenId : null;
    
    return {
      txHash: receipt.hash,
      tokenId: tokenId ? Number(tokenId) : 0,
    };
  } catch (error: any) {
    console.error('Error issuing credits:', error);
    throw new Error(`Failed to issue credits: ${error.message}`);
  }
};

// Transfer credits
export const transferCredits = async (
  tokenId: number,
  toAddress: string
): Promise<string> => {
  try {
    loadABIs();
    const contract = getTokenContract();
    
    const tx = await contract.transferCredit(tokenId, toAddress);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error transferring credits:', error);
    throw new Error(`Failed to transfer credits: ${error.message}`);
  }
};

// Retire credits
export const retireCredits = async (
  tokenId: number,
  reason: string
): Promise<string> => {
  try {
    loadABIs();
    const contract = getTokenContract();
    
    const tx = await contract.retireCredit(tokenId, reason);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error retiring credits:', error);
    throw new Error(`Failed to retire credits: ${error.message}`);
  }
};

// Get credit details
export const getCreditDetails = async (tokenId: number) => {
  try {
    loadABIs();
    const contract = getTokenContract();
    const provider = getProvider();
    
    const contractWithProvider = contract.connect(provider);
    const details = await contractWithProvider.getCreditDetails(tokenId);
    
    return {
      owner: details.owner,
      amount: Number(details.amount),
      isRetired: details.isRetired,
      metadata: details.metadata,
    };
  } catch (error: any) {
    console.error('Error getting credit details:', error);
    throw new Error(`Failed to get credit details: ${error.message}`);
  }
};

// Register report on blockchain
export const registerReport = async (
  reportId: number,
  companyAddress: string
): Promise<number> => {
  try {
    loadABIs();
    const contract = getRegistryContract();
    
    const tx = await contract.registerReport(reportId, companyAddress);
    const receipt = await tx.wait();
    
    // Get registry ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'ReportRegistered';
      } catch {
        return false;
      }
    });
    
    const registryId = event ? contract.interface.parseLog(event).args.registryId : reportId;
    
    return Number(registryId);
  } catch (error: any) {
    console.error('Error registering report:', error);
    throw new Error(`Failed to register report: ${error.message}`);
  }
};

// Approve report and issue credits
export const approveReport = async (
  reportId: number,
  credits: number
): Promise<boolean> => {
  try {
    loadABIs();
    const contract = getRegistryContract();
    
    const tx = await contract.approveReport(reportId, credits);
    await tx.wait();
    
    return true;
  } catch (error: any) {
    console.error('Error approving report:', error);
    throw new Error(`Failed to approve report: ${error.message}`);
  }
};

// Initialize - load ABIs on module load
loadABIs();
