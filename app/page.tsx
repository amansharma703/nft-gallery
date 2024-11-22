'use client';

import { useState } from 'react';
import { WalletConnect } from '@/components/wallet-connect';
import { NFTGrid } from '@/components/nft-grid';
import { alchemy } from '@/lib/alchemy';
import { Wallet2Icon } from 'lucide-react';
import { OwnedNft } from 'alchemy-sdk';

export default function Home() {
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [loading, setLoading] = useState(false);

  const handleConnect = async (address: string) => {
    setLoading(true);
    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address);
      console.log(nftsForOwner);
      setNfts(nftsForOwner.ownedNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="mb-8">
            <Wallet2Icon className="h-16 w-16 mb-4" />
            <h1 className="text-4xl font-bold mb-4">NFT Gallery</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your MetaMask wallet to view your NFT collection across all chains.
            </p>
          </div>
          <WalletConnect onConnect={handleConnect} />
        </div>
        
        <NFTGrid nfts={nfts} loading={loading} />
      </div>
    </main>
  );
}