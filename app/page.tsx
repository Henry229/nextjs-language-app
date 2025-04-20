import Link from 'next/link';

export default function Home() {
  return (
    <main className='min-h-screen p-8 flex flex-col items-center justify-center text-[hsl(var(--foreground))]'>
      <h1 className='text-4xl font-bold mb-8'>언어 학습 웹 서비스</h1>

      <div className='max-w-2xl text-center mb-12'>
        <p className='text-xl mb-4'>
          모국어와 학습할 외국어를 활용하여 효과적으로 언어를 학습하세요.
        </p>
        <p className='text-gray-600'>
          단계별 학습을 통해 체계적으로 외국어 실력을 향상시킬 수 있습니다.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl'>
        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>1단계: 영작 연습</h2>
          <p className='text-gray-600 mb-4'>
            모국어 문장을 보고 학습 언어로 작성하는 연습을 통해 기본 문장
            구성력을 키웁니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>2단계: 플래시 카드</h2>
          <p className='text-gray-600 mb-4'>
            카드 형태의 학습을 통해 문장을 익히고, 음성으로 정확한 발음을
            들어봅니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>3단계: 컨텍스트 학습</h2>
          <p className='text-gray-600 mb-4'>
            문장이 사용되는 상황과 맥락을 이해하고, 자연스러운 표현을 배웁니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>4단계: 말하기 연습</h2>
          <p className='text-gray-600 mb-4'>
            음성 인식 기술을 활용해 직접 말하기를 연습하고 피드백을 받습니다.
          </p>
        </div>
      </div>

      <Link
        href='/learn'
        className='mt-12 px-8 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium rounded-md hover:bg-opacity-90 transition-all hover:shadow-lg'
      >
        학습 시작하기
      </Link>
    </main>
  );
}
