'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full border-t border-border/40 bg-background py-8'>
      <div className='container px-4 md:px-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* 회사 정보 */}
          <div className='space-y-3'>
            <Link
              href='/'
              className='flex items-center gap-2 font-bold text-xl'
            >
              <span className='text-primary'>Language</span>
              <span>Master</span>
            </Link>
            <p className='text-sm text-muted-foreground max-w-xs'>
              효율적인 언어 학습을 위한 최적의 플랫폼. 영작 연습부터 음성 인식
              말하기 연습까지 모든 단계를 제공합니다.
            </p>
            <p className='text-sm text-muted-foreground'>
              &copy; {currentYear} Language Master. All rights reserved.
            </p>
          </div>

          {/* 사이트맵 */}
          <div className='space-y-3'>
            <h3 className='text-lg font-medium'>학습 단계</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/learn/stage1'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  영작 연습 (Stage 1)
                </Link>
              </li>
              <li>
                <Link
                  href='/learn/stage2'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  플래시 카드 (Stage 2)
                </Link>
              </li>
              <li>
                <Link
                  href='/learn/stage3'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  컨텍스트 학습 (Stage 3)
                </Link>
              </li>
              <li>
                <Link
                  href='/learn/stage4'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  말하기 연습 (Stage 4)
                </Link>
              </li>
            </ul>
          </div>

          {/* 더 많은 링크 */}
          <div className='space-y-3'>
            <h3 className='text-lg font-medium'>참고 자료</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/about'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link
                  href='/support'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  지원 및 도움말
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  개인정보 보호정책
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 소셜 미디어 아이콘 */}
        <div className='mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4'>
          <p className='text-xs text-muted-foreground'>
            효과적인 언어 학습을 위한 완벽한 솔루션
          </p>
          <div className='flex items-center space-x-4'>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label='Twitter'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
              </svg>
            </a>
            <a
              href='https://facebook.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label='Facebook'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
              </svg>
            </a>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label='Instagram'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
                <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
