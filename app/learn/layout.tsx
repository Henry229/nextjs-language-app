import React from 'react';
import Link from 'next/link';

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] p-4 shadow-md'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>
            언어 학습 웹 서비스
          </Link>
          <nav className='space-x-4'>
            <Link href='/learn' className='hover:underline'>
              학습 메인
            </Link>
          </nav>
        </div>
      </header>

      <main className='flex-grow container mx-auto p-4 md:p-6 max-w-5xl'>
        {children}
      </main>

      <footer className='bg-[hsl(var(--secondary))] p-4 text-center text-[hsl(var(--secondary-foreground))] text-sm border-t border-[hsl(var(--border))]'>
        <div className='container mx-auto'>
          <p>© 2024 언어 학습 웹 서비스. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
