'use client';

import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className='text-[hsl(var(--foreground))]'>
      <h1 className='text-3xl font-bold mb-6'>언어 학습</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-8'>
        <Link
          href='/learn/stage1'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            1단계: CSV 문장 입력 및 영작 연습
          </h2>
          <p className='text-gray-600'>
            모국어 문장을 보고 학습 언어로 작성하는 연습을 통해 기본 문장
            구성력을 키웁니다.
          </p>
        </Link>

        <Link
          href='/learn/stage2'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>2단계: 플래시 카드 학습</h2>
          <p className='text-gray-600'>
            카드 형태의 학습을 통해 문장을 익히고, 음성으로 정확한 발음을
            들어봅니다.
          </p>
        </Link>

        <Link
          href='/learn/stage3'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            3단계: 문맥 이해를 위한 Podcast
          </h2>
          <p className='text-gray-600'>
            문장이 사용되는 상황과 맥락을 이해하고, 자연스러운 표현을 배웁니다.
          </p>
        </Link>

        <Link
          href='/learn/stage4'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            4단계: 음성인식 말하기 연습
          </h2>
          <p className='text-gray-600'>
            음성 인식 기술을 활용해 직접 말하기를 연습하고 피드백을 받습니다.
          </p>
        </Link>
      </div>

      <div className='p-6 bg-[hsl(var(--secondary))] rounded-lg border border-[hsl(var(--border))]'>
        <h2 className='text-lg font-bold mb-2'>시작하기</h2>
        <p className='text-gray-700'>
          언어 학습을 시작하려면 1단계에서 CSV 형식의 학습 문장을 입력하세요.
          모든 단계는 순차적으로 진행하는 것이 가장 효과적입니다.
        </p>
      </div>
    </div>
  );
}
