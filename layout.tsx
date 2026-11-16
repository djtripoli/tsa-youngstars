import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'HYROX Youngstars | Texas Sports Academy', description: 'Live HYROX Youngstars event results and leaderboards.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
