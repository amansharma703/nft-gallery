'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import StepperIcon from './ui/icons/stepper';
import { Button } from './ui/button';
import { NftOrdering, OwnedNft } from 'alchemy-sdk';
import { alchemy } from '@/lib/alchemy';

type Step = {
    number: number;
    isCompleted: boolean;
    headerText?: string;
    subHeaderText?: string;
};

export function StepperDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [nfts, setNfts] = useState<any[]>([
        {
            name: 'Wine Bottle Club',
            vintage: '2018',
            quantity: '1',
            tokenId: '1',
        }, {
            name: 'Wine Bottle Club',
            vintage: '2018',
            quantity: '1',
            tokenId: '2',
        },
        {
            name: 'Wine     Club',
            vintage: '2018',
            quantity: '1',
            tokenId: '1',
        }, {
            name: 'Wine Bottle Club',
            vintage: '2018',
            quantity: '1',
            tokenId: '2',
        }

    ]);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        walletETH: '',
    });

    const handleConnect = async (address: string) => {
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

    const steps: Step[] = [
        {
            number: 1,
            isCompleted: false,
            headerText: 'Connect your Wine Bottle Club Wallet',
            subHeaderText: 'Please connect your Ethereum wallet to access and manage your bottle(s)'
        },
        {
            number: 2,
            isCompleted: false,
            headerText: 'Select your Wine Bottle Club Bottle(s)',
            subHeaderText: 'Please select the wine bottle(s) you wish to transfer'
        },
        {
            number: 3,
            isCompleted: false,
            headerText: 'Connect your Polygon Wallet Address',
            subHeaderText: 'Please enter your Polygon wallet address to link your account for seamless transactions and interactions.'
        },
        {
            number: 4,
            isCompleted: false,
            headerText: 'Your transfer request has been successfully recorded.',
            subHeaderText: 'Thank you for submitting your request. We will process it promptly.'
        },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleContinue = (step: number) => {
        setCurrentStep(step + 1);
    }

    const handlePrevious = (step: number) => {
        setCurrentStep(step - 1);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full sm:max-w-4xl min-h-96 bg-white p-0 pt-6 pb-10 gap-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-center text-[#282A37] text-3xl font-semibold">
                        {steps[currentStep - 1].headerText}
                    </DialogTitle>
                    <p className="text-center text-secondary mt-2">
                        {steps[currentStep - 1].subHeaderText}
                    </p>
                </DialogHeader>

                <div className='px-40'>
                    {/* Stepper */}
                    <div className="relative mx-10 flex justify-between items-center mb-12">
                        {/* Progress Line */}
                        <div
                            className="absolute top-1/2 left-0 right-0 -translate-y-1/2"
                            style={{
                                height: '1.5px',
                                background: 'repeating-linear-gradient(to right, #E5E7EB 0, #E5E7EB 4px, transparent 4px, transparent 8px)'
                            }}
                        />

                        {/* Steps */}
                        <div className="relative flex justify-between w-full">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center z-10',
                                            currentStep === step.number
                                                ? 'bg-black'
                                                : currentStep > step.number
                                                    ? 'bg-gray-200'
                                                    : 'bg-gray-200',
                                            'transition-colors duration-200'
                                        )}
                                    >
                                        <StepperIcon />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="py-6 pt-0">
                        {currentStep === 1 && (
                            <div className="space-y-4 max-w-3xl mx-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#282A37] mb-1">
                                            First name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-[#282A37]"
                                            placeholder="Lucas"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#282A37] mb-1">
                                            Last name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-[#282A37]"
                                            placeholder="InterCellar"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#282A37] mb-1">
                                        Wallet ETH
                                    </label>
                                    <input
                                        type="text"
                                        name="walletETH"
                                        value={formData.walletETH}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-[#282A37]"
                                        placeholder="xxxx-xxxx-xxxx-xxxx"
                                    />
                                    <p className="text-sm text-[#858DAB] mt-1">
                                        Connect your wallet to check for NFTs Wine Bottle Club
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div
                                className="space-y-4 max-w-3xl mx-auto max-h-64 overflow-y-auto pr-4 custom-scrollbar"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#E5E7EB transparent'
                                }}
                            >
                                {nfts.map((nft: any) => {
                                    return (
                                        <div key={nft.tokenId} className='space-y-2'>
                                            <div className='text-black text-sm font-medium'>
                                                {nft.name}
                                            </div>
                                            <div className='p-3 border border-[#ECEDF2]'>
                                                <p className='text-secondary text-sm font-medium'>
                                                    Vintage: {nft.vintage}
                                                </p>
                                                <p className='text-secondary text-sm font-medium'>
                                                    Quantity: {nft.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 max-w-3xl mx-auto">

                                <div>
                                    <label className="block text-sm font-medium text-[#282A37] mb-1">
                                        Polygon Wallet address (from InterCellar)
                                    </label>
                                    <input
                                        type="text"
                                        name="walletETH"
                                        value={formData.walletETH}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-[#282A37]"
                                        placeholder="xxxx-xxxx-xxxx-xxxx"
                                    />
                                    <p className="text-sm text-[#858DAB] mt-1">
                                        Enter your polygon wallet address, if you are not sure how to find it: <Link href={"#"} className='font-bold'>
                                            check out our tutorial video.
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}

                        {
                            currentStep === 4 ? (
                                <div className="flex justify-center gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        className="px-4 py-2 text-sm font-medium border border-[#D5D8E2] hover:bg-gray-100 text-[#282A37] rounded-none"
                                    >
                                        Previous
                                    </Button>
                                    <Link
                                        href={"#"}
                                        onClick={() => setCurrentStep(2)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-[#151518] rounded-none"
                                    >
                                        Visit InterCellar.io
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        className="px-4 py-2 text-sm font-medium border border-[#D5D8E2] hover:bg-gray-100 text-[#282A37]  rounded-none"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleContinue(currentStep)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-[#151518] rounded-none"
                                    >
                                        Continue
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
} 