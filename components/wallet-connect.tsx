'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Wallet2Icon } from 'lucide-react';
import { ethers } from 'ethers';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
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

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    onDisconnect();
    toast({
      title: 'Wallet Disconnected',
      description: 'You have successfully disconnected your wallet.',
    });
  };

  return (
    <>
      {
        isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-2"
                variant={isConnected ? "outline" : "default"}
              >
                <Wallet2Icon className="h-4 w-4" />
                {isConnected
                  ? `${address.substring(0, 6)}...${address.substring(38)}`
                  : 'Connect Wallet'}
              </Button>
            </DropdownMenuTrigger>
            {isConnected && (
              <DropdownMenuContent sideOffset={4}>
                <DropdownMenuItem onClick={disconnectWallet}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        ) : (
          <Button
            onClick={isConnected ? disconnectWallet : connectWallet}
            className="gap-2"
            variant={isConnected ? "outline" : "default"}
          >
            <Wallet2Icon className="h-4 w-4" />
            {isConnected
              ? `${address.substring(0, 6)}...${address.substring(38)}`
              : 'Connect Wallet'}
          </Button>
        )
      }

    </>
  );
}