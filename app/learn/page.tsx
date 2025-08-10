'use client';

import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className='text-[hsl(var(--foreground))]'>
      <h1 className='text-3xl font-bold mb-6'>언어 학습</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 my-8'>
        <Link
          href='/learn/stage1'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            1단계: CSV 문장 입력 및 카드 학습
          </h2>
          <p className='text-gray-600'>
            CSV 파일에서 불러온 문장을 Anki 스타일 카드로 학습합니다. 문장을 암기하고, 
            카드를 뒤집어 정확한 발음을 들어볼 수 있습니다.
          </p>
        </Link>

        <Link
          href='/learn/stage2'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>2단계: 음성인식 말하기 연습</h2>
          <p className='text-gray-600'>
            모국어를 보고 학습 언어로 말하면 음성인식(STT) 기능으로 정확도를 
            검증합니다. 발음과 문장 구성을 직접 연습할 수 있습니다.
          </p>
        </Link>

        <Link
          href='/learn/stage3'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            3단계: 상황극 기반 자유 대화
          </h2>
          <p className='text-gray-600'>
            OpenAI를 활용해 학습 콘텐츠를 바탕으로 자연스러운 대화를 진행합니다.
            감정 표현이 포함된 음성으로 진짜 원어민과 대화하는 것처럼 연습할 수 있습니다.
          </p>
        </Link>
      </div>

      <div className='p-6 bg-[hsl(var(--secondary))] rounded-lg border border-[hsl(var(--border))]'>
        <h2 className='text-lg font-bold mb-2'>시작하기</h2>
        <p className='text-gray-700'>
          언어 학습을 시작하려면 1단계에서 CSV 형식의 학습 문장을 입력하세요.
          모든 단계는 순차적으로 진행하는 것이 가장 효과적입니다. 또는{' '}
          <Link href='/folders' className='text-blue-600 hover:underline'>
            폴더 관리
          </Link>
          로 이동하여 체계적으로 학습 컨텐츠를 구성할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
