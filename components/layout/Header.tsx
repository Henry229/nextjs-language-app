'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * 상단 헤더 컴포넌트
 * 네비게이션 링크와 모바일 메뉴를 포함합니다.
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className='w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
        <Link href='/' className='flex items-center gap-2 font-bold text-xl'>
          <span className='text-primary'>Language</span>
          <span>Master</span>
        </Link>

        {/* 모바일 메뉴 버튼 */}
        <button
          className='md:hidden flex items-center p-2'
          onClick={toggleMenu}
          aria-label='Toggle menu'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            {isMenuOpen ? (
              <path d='M18 6L6 18M6 6l12 12' />
            ) : (
              <path d='M4 12h16M4 6h16M4 18h16' />
            )}
          </svg>
        </button>

        {/* 데스크톱 네비게이션 */}
        <nav className='hidden md:flex gap-6'>
          <Link
            href='/learn'
            className='text-sm font-medium transition-colors hover:text-primary'
          >
            학습하기
          </Link>
          <Link
            href='/learn/stage1'
            className='text-sm font-medium transition-colors hover:text-primary'
          >
            영작 연습
          </Link>
          <Link
            href='/learn/stage2'
            className='text-sm font-medium transition-colors hover:text-primary'
          >
            플래시 카드
          </Link>
          <Link
            href='/learn/stage3'
            className='text-sm font-medium transition-colors hover:text-primary'
          >
            컨텍스트 학습
          </Link>
          <Link
            href='/learn/stage4'
            className='text-sm font-medium transition-colors hover:text-primary'
          >
            말하기 연습
          </Link>
        </nav>
      </div>

      {/* 모바일 메뉴 */}
      <div
        className={cn(
          'md:hidden absolute w-full bg-background shadow-lg transition-transform duration-300 ease-in-out z-50',
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <nav className='flex flex-col px-4 py-4'>
          <Link
            href='/learn'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            학습하기
          </Link>
          <Link
            href='/learn/stage1'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            영작 연습
          </Link>
          <Link
            href='/learn/stage2'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            플래시 카드
          </Link>
          <Link
            href='/learn/stage3'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            컨텍스트 학습
          </Link>
          <Link
            href='/learn/stage4'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            말하기 연습
          </Link>
        </nav>
      </div>
    </header>
  );
}
