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

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl'>
        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>1단계: CSV 문장 입력 및 카드 학습</h2>
          <p className='text-gray-600 mb-4'>
            CSV 파일에서 불러온 문장을 Anki 스타일 카드로 학습합니다. 문장을 암기하고, 
            카드를 뒤집어 정확한 발음을 들어볼 수 있습니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>2단계: 음성인식 말하기 연습</h2>
          <p className='text-gray-600 mb-4'>
            모국어를 보고 학습 언어로 말하면 음성인식(STT) 기능으로 정확도를 
            검증합니다. 발음과 문장 구성을 직접 연습할 수 있습니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>3단계: 상황극 기반 자유 대화</h2>
          <p className='text-gray-600 mb-4'>
            OpenAI를 활용해 학습 콘텐츠를 바탕으로 자연스러운 대화를 진행합니다.
            감정 표현이 포함된 음성으로 진짜 원어민과 대화하는 것처럼 연습할 수 있습니다.
          </p>
        </div>
      </div>

      <div className='flex gap-4 mt-12'>
        <Link
          href='/learn'
          className='px-8 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium rounded-md hover:bg-opacity-90 transition-all hover:shadow-lg'
        >
          학습 시작하기
        </Link>
        <Link
          href='/folders'
          className='px-8 py-3 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-medium rounded-md hover:bg-opacity-90 transition-all hover:shadow-lg'
        >
          폴더 관리
        </Link>
      </div>
    </main>
  );
}
