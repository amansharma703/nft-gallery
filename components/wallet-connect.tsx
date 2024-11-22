'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Wallet2Icon } from 'lucide-react';
import { ethers } from 'ethers';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        onConnect(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask not found',
        description: 'Please install MetaMask to use this feature',
        variant: 'destructive',
      });
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setIsConnected(true);
      setAddress(accounts[0]);
      onConnect(accounts[0]);
      
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to MetaMask',
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to MetaMask',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={connectWallet}
      className="gap-2"
      variant={isConnected ? "outline" : "default"}
    >
      <Wallet2Icon className="h-4 w-4" />
      {isConnected
        ? `${address.substring(0, 6)}...${address.substring(38)}`
        : 'Connect Wallet'}
    </Button>
  );
}