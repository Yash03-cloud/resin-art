import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import ClientLayout from '@/components/ClientLayout';
import '@/index.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://artvibe-resin-art.vercel.app'),
  title: 'Artvibe by Charu | Handcrafted Resin Art, Decor & Luxury Jewellery',
  description:
    'Artvibe by Charu - Discover unique handcrafted resin art pieces, wall decor, custom ocean clocks, coasters, and botanical jewellery made with premium UV-resistant epoxy resin.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    title: 'Artvibe by Charu | Handcrafted Resin Art, Decor & Luxury Jewellery',
    description:
      'Discover unique handcrafted resin art pieces, wall decor, custom ocean clocks, coasters, and botanical jewellery made with premium UV-resistant epoxy resin.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <ClientLayout>{children}</ClientLayout>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Poppins, sans-serif',
              borderRadius: '12px',
              border: '1px solid #F3F4F6',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#6B46C1', secondary: 'white' },
            },
          }}
        />
      </body>
    </html>
  );
}

