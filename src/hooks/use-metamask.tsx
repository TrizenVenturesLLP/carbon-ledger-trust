import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';

interface MetaMaskState {
  isInstalled: boolean;
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  isLoading: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      selectedAddress: string | null;
      chainId: string;
    };
  }
}

export const useMetaMask = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<MetaMaskState>({
    isInstalled: false,
    isConnected: false,
    account: null,
    chainId: null,
    isLoading: false,
  });

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && window.ethereum) {
      setState((prev) => ({ ...prev, isInstalled: true }));

      // Check if already connected
      if (window.ethereum.selectedAddress) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          account: window.ethereum.selectedAddress,
          chainId: window.ethereum.chainId,
        }));
      }

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            account: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            account: accounts[0],
          }));
          // Link wallet to account
          if (isAuthenticated && accounts[0]) {
            linkWallet(accounts[0]);
          }
        }
      };

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        setState((prev) => ({ ...prev, chainId }));
        window.location.reload(); // Reload page on chain change
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isAuthenticated]);

  const connect = async () => {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask Not Installed',
        description: 'Please install MetaMask to connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        const chainId = window.ethereum.chainId;

        setState({
          isInstalled: true,
          isConnected: true,
          account,
          chainId,
          isLoading: false,
        });

        // Link wallet to user account if authenticated
        if (isAuthenticated) {
          await linkWallet(account);
        }

        toast({
          title: 'Wallet Connected',
          description: `Connected to ${account.substring(0, 6)}...${account.substring(38)}`,
        });
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      if (error.code === 4001) {
        toast({
          title: 'Connection Rejected',
          description: 'Please connect your MetaMask wallet to continue',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: error.message || 'Failed to connect wallet',
          variant: 'destructive',
        });
      }
    }
  };

  const disconnect = () => {
    setState({
      isInstalled: state.isInstalled,
      isConnected: false,
      account: null,
      chainId: null,
      isLoading: false,
    });
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const linkWallet = async (walletAddress: string) => {
    try {
      await authApi.linkWallet(walletAddress);
      toast({
        title: 'Wallet Linked',
        description: 'Your wallet address has been linked to your account',
      });
    } catch (error: any) {
      console.error('Failed to link wallet:', error);
      // Don't show error toast as this is automatic
    }
  };

  return {
    ...state,
    connect,
    disconnect,
  };
};
