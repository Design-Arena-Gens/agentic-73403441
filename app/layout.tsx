import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VisionCrafter | 4K Hyperrealistic Generator',
  description:
    'Generate bespoke 4K hyperrealistic visuals at any aspect ratio using state-of-the-art diffusion models.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
