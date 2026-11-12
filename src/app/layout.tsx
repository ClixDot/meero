import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '../components/AppShell';

const title = 'MEERO Overseas HR Consultancy | Trusted Global Recruitment & Career Guidance';
const description =
  'Connecting talent with international career opportunities. Govt of India approved recruiting agency based in Cochin, Kerala.';

export const metadata: Metadata = {
  title,
  description,
  keywords:
    'Meero Overseas HR Consultancy, overseas recruitment Kerala, Kochi recruitment agency, Gulf jobs, logistics jobs abroad, retail jobs abroad, hospitality jobs abroad, construction jobs abroad, oil and gas jobs abroad, healthcare recruitment abroad, Govt of India approved recruiting agency',
  authors: [{ name: 'MEERO Overseas HR Consultancy' }],
  metadataBase: new URL('https://www.meerohr.com'),
  openGraph: {
    type: 'website',
    url: 'https://www.meerohr.com/',
    title: 'MEERO Overseas HR Consultancy | Trusted Global Recruitment',
    description:
      'Your Global Career Starts Here. Connecting ambition with international opportunities from Kochi, Kerala.',
    images: ['/images/meero-badge.jpg'],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%23168F88'/><circle cx='50' cy='50' r='34' fill='none' stroke='white' stroke-width='5' stroke-dasharray='15 5 25 5'/><circle cx='50' cy='50' r='22' fill='none' stroke='%2321B8C1' stroke-width='4' stroke-dasharray='10 4 18 4'/><circle cx='50' cy='50' r='10' fill='none' stroke='white' stroke-width='3'/><circle cx='76' cy='24' r='7' fill='none' stroke='white' stroke-width='3'/></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: '#168F88',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-[#171B20] antialiased selection:bg-[#168F88]/15 selection:text-[#168F88]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
