'use client';

import { useState } from 'react';
import { WalletConnect } from '@/components/wallet-connect';
import { NFTGrid } from '@/components/nft-grid';
import { alchemy } from '@/lib/alchemy';
import { NftOrdering, OwnedNft } from 'alchemy-sdk';
import Image from 'next/image';
import { StepperDialog } from '@/components/stepper-dialog';

export default function Home() {
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConnect = async (address: string) => {
    setAddress(address);
    setIsConnected(true);
    setLoading(true);
    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: [process.env.NEXT_PUBLIC_WINE_BOTTLE_NFT_ADDRESS!],
        orderBy: NftOrdering.TRANSFERTIME
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
    <main className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full z-0"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* Overlay Image */}
        <div className="absolute z-10 inset-0">
          <Image
            src="/overlay.png"
            alt="Overlay Pattern"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Main Logo - Bottom Left */}
      <div className="fixed sm:bottom-24 sm:left-24 bottom-8 left-8 z-20">
        <Image
          src="/mainLogo.png"
          alt="Main Logo"
          width={40}
          height={40}
          className="object-contain"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
        {/* Title and Description */}
        <div className="text-center text-white mt-8 mb-12 sm:mb-28">
          <h1 className="text-4xl font-ramillas font-ramillas-bold mb-4">
            Transfer from Wine Bottle Club to InterCellar
          </h1>
          <p className="text-lg font-ramillas font-ramillas-light max-w-5xl mx-auto">
            Transfer the bottle behind your NFT Wine Bottle Club to InterCellar platform so that you can trade it or have it delivered . Your keep your Wine Bottle Club artwork and the advantages linked to the club, but there are no more bottles behind it.
          </p>
        </div>

        {/* Logos Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-36 mb-12 sm:mb-28">
          <Image
            src="/logo.png"
            alt="Wine Bottle Club"
            width={175}
            height={100}
            className="object-contain"
          />
          <Image
            src="/interceller.png"
            alt="InterCellar"
            width={300}
            height={200}
            className="object-contain"
          />
        </div>

        {/* Continue Button */}
        <button
          className="bg-white text-black px-20 sm:px-40 py-1.5 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          onClick={() => setDialogOpen(true)}
        >
          Continue
        </button>

        <StepperDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </main>
  );
}