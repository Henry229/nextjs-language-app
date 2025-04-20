import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Language Master - 효율적인 언어 학습',
  description:
    '효율적인 언어 학습을 위한 4단계 시스템: 영작 연습, 플래시 카드, 컨텍스트 학습, 말하기 연습',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body className={inter.className}>
        <div className='flex flex-col min-h-screen'>
          <Header />
          <main className='flex-1'>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
