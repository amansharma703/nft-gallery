'use client';

import { useState } from 'react';
import { WalletConnect } from '@/components/wallet-connect';
import { NFTGrid } from '@/components/nft-grid';
import { alchemy } from '@/lib/alchemy';
import { NftOrdering, OwnedNft } from 'alchemy-sdk';
import Image from 'next/image';

export default function Home() {
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async (address: string) => {
    setAddress(address);
    setIsConnected(true);
    setLoading(true);
    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: [process.env.NEXT_PUBLIC_WINE_BOTTLE_NFT_ADDRESS!],
        orderBy : NftOrdering.TRANSFERTIME
      });
      console.log(nftsForOwner);
      setNfts(nftsForOwner.ownedNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setIsConnected(false);
    setNfts([]);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="mb-8">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="mb-4" />
            <h1 className="text-4xl font-bold mb-4">NFT Gallery</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your MetaMask wallet to view your NFT collection across all chains.
            </p>
          </div>
          <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>
        <NFTGrid nfts={nfts} loading={loading} isConnected={isConnected} />
      </div>
    </main>
  );
}