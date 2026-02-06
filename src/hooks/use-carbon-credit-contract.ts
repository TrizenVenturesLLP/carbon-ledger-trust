import { BrowserProvider, Contract } from "ethers";
import { useMetaMask } from "@/hooks/use-metamask";

const TOKEN_ADDRESS = import.meta.env.VITE_CARBON_CREDIT_TOKEN_ADDRESS as string;

// Minimal ABI with only the methods we need
const CARBON_CREDIT_TOKEN_ABI = [
  "function transferCredit(uint256 tokenId, address to) external",
  "function retireCredit(uint256 tokenId, string reason) external",
] as const;

export const useCarbonCreditContract = () => {
  const { account } = useMetaMask();

  const getContract = async (): Promise<Contract> => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    if (!TOKEN_ADDRESS) {
      throw new Error("VITE_CARBON_CREDIT_TOKEN_ADDRESS is not configured");
    }

    const provider = new BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();

    // Optional: ensure the signer matches the linked account
    if (account && (await signer.getAddress()).toLowerCase() !== account.toLowerCase()) {
      // Not throwing here; MetaMask will still show the actual address being used
      // but we could enforce it if needed.
    }

    return new Contract(TOKEN_ADDRESS, CARBON_CREDIT_TOKEN_ABI, signer);
  };

  const transferCreditOnChain = async (tokenId: number, toAddress: string) => {
    const contract = await getContract();
    const tx = await contract.transferCredit(tokenId, toAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  };

  const retireCreditOnChain = async (tokenId: number, reason: string) => {
    const contract = await getContract();
    const tx = await contract.retireCredit(tokenId, reason);
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  };

  return {
    transferCreditOnChain,
    retireCreditOnChain,
  };
};

