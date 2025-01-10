'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OwnedNft as AlchemyOwnedNft } from 'alchemy-sdk';
import Link from 'next/link';

interface OwnedNft extends AlchemyOwnedNft {
  redeemed?: boolean;
}

interface NFTGridProps {
  nfts: OwnedNft[];
  loading: boolean;
  isConnected: boolean;
}

export function NFTGrid({ nfts, loading, isConnected }: NFTGridProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 border p-4">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <Skeleton className="w-full sm:w-28 h-28" />
          </div>
        ))}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Connect your wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to see all your WineBottleClub NFTs.
        </p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl text-dark font-semibold mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground">
          We couldn&apos;t find any NFTs from the {" "}
          <Link target='_blank' className='hover:underline hover:text-blue-500' href="https://opensea.io/collection/winebottleclub">
            WineBottleClub
          </Link> {" "}
          in this wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {nfts.map((nft, index) => (
        <div 
          key={nft.tokenId} 
          className='flex flex-col border border-[#ECEDF2] p-4 gap-4'
        >
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0'>
            <div className='flex-1 space-y-4 w-full sm:w-auto'>
              <div className='text-black text-sm font-medium'>
                {nft.name || `NFT #${nft.tokenId}`}
              </div>
              <div className='space-y-2'>
                <p className='text-secondary text-sm font-medium'>
                  Vintage: {nft.raw?.metadata?.attributes?.find((attr: any) => attr.trait_type === 'Vintage')?.value || 'N/A'}
                </p>
                <p className='text-secondary text-sm font-medium'>
                  Quantity: {nft.balance || 1}
                </p>
                <p className='text-secondary text-sm font-medium'>
                  Token ID: {nft.tokenId}
                </p>
              </div>
            </div>
            <div className='w-full sm:w-28 h-28 sm:ml-4 flex-shrink-0'>
              {nft.image?.cachedUrl && !imageError[nft.tokenId] ? (
                <div className="relative h-full w-full">
                  <Image
                    src={nft.image.cachedUrl}
                    alt={nft.name || 'NFT'}
                    fill
                    className="object-cover"
                    onError={() => setImageError(prev => ({ ...prev, [nft.tokenId]: true }))}
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs text-center">No Image</span>
                </div>
              )}
            </div>
          </div>

          { nft.redeemed && (
            <div className='text-sm text-red-500 font-semibold text-center'>
              This NFT has already been redeemed to Intercellar
            </div>
          )}
        </div>
      ))}
    </div>
  );
}