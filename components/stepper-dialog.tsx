'use client';

import { useState, useEffect } from 'react';
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
import { ethers } from 'ethers';
import { useToast } from "@/components/ui/use-toast";
import { NFTGrid } from './nft-grid';

type Step = {
    number: number;
    isCompleted: boolean;
    headerText?: string;
    subHeaderText?: string;
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

const initialFormData = {
    firstName: '',
    lastName: '',
    walletETH: '',
    walletPolygon: '',
}

export function StepperDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [nfts, setNfts] = useState<OwnedNft[]>([
    ]);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);

    const [accounts, setAccounts] = useState<string[]>([]);
    const [metamaskError, setMetamaskError] = useState<string>('');

    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

    

    useEffect(() => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(provider);

            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            // Check if already connected
            provider.listAccounts().then(handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = async (newAccounts: string[]) => {
        console.log('Accounts changed:', newAccounts);
        setAccounts(newAccounts);
        if (newAccounts.length > 0 && formData.walletETH === '') {
            setFormData(prev => ({ ...prev, walletETH: newAccounts[0] }));
        }
    };

    const handleConnect = async (address: string) => {
        setLoading(true);
        try {
            const nftsForOwner = await alchemy.nft.getNftsForOwner(address, {
                contractAddresses: [process.env.NEXT_PUBLIC_WINE_BOTTLE_NFT_ADDRESS!],
                orderBy: NftOrdering.TRANSFERTIME
            });
            setNfts(nftsForOwner.ownedNfts);
        } catch (error) {
            console.error('Error fetching NFTs:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectMetaMask = async () => {
        setLoading(true);
        setMetamaskError('');

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            if (!provider) {
                throw new Error('Provider not initialized');
            }

            // Request accounts access
            const accounts = await provider.send('eth_requestAccounts', []);

            // Get all accounts
            const allAccounts = await provider.listAccounts();


            handleAccountsChanged(allAccounts);

            setFormData(prev => ({ ...prev, walletETH: allAccounts[0] }));

        } catch (error: any) {
            setMetamaskError(error.message || 'Failed to connect to MetaMask');
            console.error('MetaMask connection error:', error);
        } finally {
            setLoading(false);
        }
    };





    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const [isContinueLoading, setIsContinueLoading] = useState(false);

    const isValidPolygonAddress = (address: string): boolean => {
        try {
            // Check if it's a valid Ethereum address format (Polygon uses the same format)
            const isValidFormat = ethers.utils.isAddress(address);
            // You can add additional Polygon-specific checks here if needed
            return isValidFormat;
        } catch {
            return false;
        }
    };

    console.log('nfts', formData);

    const handleContinue = async (step: number) => {
        switch (step) {
            case 1:
                if (!formData.firstName.trim()) {
                    toast({
                        variant: "destructive",
                        title: "First name is required",
                        description: "Please enter your first name to continue.",
                    });
                    return;
                }
                if (!formData.lastName.trim()) {
                    toast({
                        variant: "destructive",
                        title: "Last name is required",
                        description: "Please enter your last name to continue.",
                    });
                    return;
                }
                if (!formData.walletETH) {
                    toast({
                        variant: "destructive",
                        title: "Wallet connection required",
                        description: "Please connect your MetaMask wallet to continue.",
                    });
                    return;
                }

                setIsContinueLoading(true);
                try {
                    await handleConnect(formData.walletETH);
                    setCurrentStep(step + 1);
                } catch (error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to fetch NFTs. Please try again.",
                    });
                } finally {
                    setIsContinueLoading(false);
                }
                break;
            case 2:
                setCurrentStep(step + 1);
                break;
            case 3:
                if (!formData.walletPolygon.trim()) {
                    toast({
                        variant: "destructive",
                        title: "Polygon wallet address required",
                        description: "Please enter your Polygon wallet address to continue.",
                    });
                    return;
                }
                if (!isValidPolygonAddress(formData.walletPolygon)) {
                    toast({
                        variant: "destructive",
                        title: "Invalid Polygon address",
                        description: "Please enter a valid Polygon wallet address.",
                    });
                    return;
                }
                setCurrentStep(step + 1);
                break;
            default:
                setCurrentStep(step + 1);
        }
    }

    const handlePrevious = (step: number) => {
        setCurrentStep(step - 1);
    }

    const handleAccountSelect = async (account: string) => {
        console.log('account', account);
        setFormData(prev => ({ ...prev, walletETH: account }));
    };

    const disconnectMetaMask = () => {
        setAccounts([]);
        setFormData(prev => ({ ...prev, walletETH: '' }));
        setMetamaskError('');
        toast({
            title: "Wallet Disconnected",
            description: "Your MetaMask wallet has been disconnected.",
        });
    };

    const [polygonAddressError, setPolygonAddressError] = useState<string>('');

    const handlePolygonAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = e.target.value;
        setFormData(prev => ({ ...prev, walletPolygon: address }));
        
        if (address && !isValidPolygonAddress(address)) {
            setPolygonAddressError('Please enter a valid Polygon wallet address');
        } else {
            setPolygonAddressError('');
        }
    };

    const renderStep1Content = () => (
        <div className="space-y-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                        First name
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-dark"
                        placeholder="Lucas"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                        Last name
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-dark"
                        placeholder="InterCellar"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-dark mb-1">
                    Ethereum Wallet
                </label>
                {accounts.length > 0 ? (
                    <div className="space-y-2">
                        <select
                            value={formData.walletETH}
                            onChange={(e) => handleAccountSelect(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white text-dark"
                        >
                            {accounts.map((account) => (
                                <option key={account} value={account}>
                                    {account}
                                </option>
                            ))}
                        </select>
                        <div className="text-right">
                            <button
                                onClick={disconnectMetaMask}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Disconnect wallet
                            </button>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={connectMetaMask}
                        disabled={loading}
                        className="w-full px-3 py-2 text-white bg-black hover:bg-[#151518] rounded-none"
                    >
                        {loading ? 'Connecting...' : 'Connect MetaMask'}
                    </Button>
                )}
                {metamaskError && (
                    <p className="text-sm text-red-500 mt-1">
                        {metamaskError}
                    </p>
                )}
                <p className="text-sm text-[#858DAB] mt-1">
                    Connect your wallet to check for NFTs Wine Bottle Club
                </p>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] sm:max-w-4xl min-h-96 bg-white p-0 pt-6 pb-10 gap-0 mx-auto">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-center text-dark text-2xl sm:text-3xl font-semibold">
                        {steps[currentStep - 1].headerText}
                    </DialogTitle>
                    <p className="text-center text-secondary mt-2 px-4 sm:px-0">
                        {steps[currentStep - 1].subHeaderText}
                    </p>
                </DialogHeader>

                <div className='px-4 sm:px-40'>
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
                        {currentStep === 1 && renderStep1Content()}

                        
                        
                        {currentStep === 2 && (
                            <div className="space-y-4 max-w-3xl mx-auto max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                <NFTGrid 
                                    nfts={nfts} 
                                    loading={false} 
                                    isConnected={!!formData.walletETH} 
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 max-w-3xl mx-auto">
                                <div>
                                    <label className="block text-sm font-medium text-dark mb-1">
                                        Polygon Wallet address (from InterCellar)
                                    </label>
                                    <input
                                        type="text"
                                        name="walletPolygon"
                                        value={formData.walletPolygon}
                                        onChange={handlePolygonAddressChange}
                                        className={cn(
                                            "w-full px-3 py-2 border rounded-none bg-white text-dark",
                                            polygonAddressError ? "border-red-500" : "border-gray-300"
                                        )}
                                        placeholder="xxxx-xxxx-xxxx-xxxx"
                                        
                                    />
                                    {polygonAddressError && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {polygonAddressError}
                                        </p>
                                    )}
                                    <p className="text-sm text-[#858DAB] mt-1">
                                        Enter your polygon wallet address, if you are not sure how to find it: {" "}
                                        <Link href={"#"} className='font-bold hover:underline'>
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
                                        onClick={() => {
                                            onOpenChange(false);
                                            setFormData(initialFormData);
                                            setNfts([]);
                                            setCurrentStep(1);
                                        }}
                                        className="px-4 py-2 text-sm font-medium border border-[#D5D8E2] hover:bg-gray-100 text-dark rounded-none"
                                    >
                                        Close
                                    </Button>
                                    <Link
                                        href={"https://www.intercellar.io"}
                                        target="_blank"
                                        className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-[#151518] rounded-none"
                                    >
                                        Visit InterCellar.io
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                                    {currentStep === 1 ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => onOpenChange(false)}
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-[#D5D8E2] hover:bg-gray-100 text-dark rounded-none"
                                        >
                                            Cancel
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePrevious(currentStep)}
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-[#D5D8E2] hover:bg-gray-100 text-dark rounded-none"
                                        >
                                            Previous
                                        </Button>
                                    )}

                                        <Button  
                                        onClick={() => handleContinue(currentStep)}
                                        disabled={isContinueLoading || (currentStep === 2 && nfts.length === 0)}
                                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-black hover:bg-[#151518] rounded-none"
                                    >
                                        {isContinueLoading ? (
                                            <div className="flex items-center gap-2">
                                                <svg 
                                                    className="animate-spin h-4 w-4" 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle 
                                                        className="opacity-25" 
                                                        cx="12" 
                                                        cy="12" 
                                                        r="10" 
                                                        stroke="currentColor" 
                                                        strokeWidth="4"
                                                    />
                                                    <path 
                                                        className="opacity-75" 
                                                        fill="currentColor" 
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Processing...
                                            </div>
                                        ) : (
                                            'Continue'
                                        )}
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