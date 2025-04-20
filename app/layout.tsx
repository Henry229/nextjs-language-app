import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '언어 학습 웹 서비스',
  description: '단계별 외국어 학습 웹 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className='min-h-screen bg-[hsl(var(--background))]'>
        {children}
      </body>
    </html>
  );
}
