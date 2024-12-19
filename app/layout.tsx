import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import localFont from 'next/font/local';

const inter = Inter({ subsets: ['latin'] });

const ramillas = localFont({
  src: [
    {
      path: '../public/assets/fonts/Ramillas-Light.ttf',
      weight: '400',
    },
    {
      path: '../public/assets/fonts/Ramillas-Medium.ttf',
      weight: '500',
    },
    {
      path: '../public/assets/fonts/Ramillas-Bold.ttf',
      weight: '800',
    },
    {
      path: '../public/assets/fonts/Ramillas-Regular.ttf',
      weight: '400',
    },
  ],
  variable: '--font-ramillas',
});

export const metadata: Metadata = {
  title: 'WineBottleClub NFT - Connect with MetaMask',
  description: 'Claim your WineBottleClub NFT and transfer it to Intercellar',
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="View your NFT collection by connecting your MetaMask wallet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${ramillas.variable} ${inter.className} bg-[#09090b]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}