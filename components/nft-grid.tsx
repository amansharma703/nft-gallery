'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OwnedNft } from 'alchemy-sdk';
import Link from 'next/link';

interface NFTGridProps {
  nfts: OwnedNft[];
  loading: boolean;
  isConnected: boolean;
}

export function NFTGrid({ nfts, loading, isConnected }: NFTGridProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-0">
              <Skeleton className="h-[300px] w-full" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Connect your wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to see all your
          Wine Bottle Club NFTs.
        </p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground">
          We couldn&apos;t find any NFTs from the {" "}
          <Link target='_blank' className='hover:underline hover:text-blue-500' href="https://opensea.io/collection/winebottleclub">
            Wine Bottle Club
          </Link> {" "}
          in this wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft, index) => (
        <Card key={`${nft.contract.address}-${nft.tokenId}-${index}`} className="overflow-hidden">
          <CardHeader className="p-0">
            {nft.image?.cachedUrl && !imageError[nft.tokenId] ? (
              <div className="relative h-[300px] w-full">
                <Image
                  src={nft.image.cachedUrl}
                  alt={nft.name || 'NFT'}
                  fill
                  className="object-cover"
                  onError={() => setImageError(prev => ({ ...prev, [nft.tokenId]: true }))}
                />
              </div>
            ) : (
              <div className="h-[300px] w-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image Available</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2 truncate">
              <Link href={nft.raw.metadata.external_link || `https://opensea.io/assets/ethereum/${nft.contract.address}/${nft.tokenId}`} target="_blank" className="hover:underline hover:text-blue-500">
                {nft.name || `NFT #${nft.tokenId}`}
              </Link>
            </CardTitle>
            {nft.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {nft.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Collection: {nft.collection?.name || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground">
              Contract: {nft.contract.address}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Token ID: {nft.tokenId}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}