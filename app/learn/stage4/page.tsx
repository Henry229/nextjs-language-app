'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/types/card';
import Stage4Speaking from '@/components/learn/Stage4Speaking';
import Button from '@/components/ui/Button';

export default function Stage4Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  // 로컬 스토리지에서 저장된 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCards = localStorage.getItem('learningCards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }

      // 학습 완료 상태도 확인
      const completedStatus = localStorage.getItem('stage4Completed');
      if (completedStatus === 'true') {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
    }
    setIsLoading(false);
  }, []);

  const handleSpeakingComplete = () => {
    // 완료 상태를 로컬 스토리지에 저장
    try {
      localStorage.setItem('stage4Completed', 'true');
      setIsCompleted(true);
    } catch (error) {
      console.error('학습 완료 상태 저장 실패:', error);
    }
  };

  // 다시 시작 - 진행 상태 초기화
  const handleRestart = () => {
    try {
      localStorage.removeItem('stage4Progress');
      localStorage.removeItem('stage4Completed');
      setIsCompleted(false);
      window.location.reload(); // 페이지 새로고침
    } catch (error) {
      console.error('진행 상태 초기화 실패:', error);
    }
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn/stage3');
  };

  // 학습 메인으로 이동
  const handleGoToLearn = () => {
    router.push('/learn');
  };

  // 카드가 없는 경우의 처리
  const handleGoToStage1 = () => {
    router.push('/learn/stage1');
  };

  // 학습 완료 결과 화면
  const CompletionResult = () => (
    <div className='bg-[hsl(var(--card))] p-8 rounded-lg shadow-md border border-[hsl(var(--border))]'>
      <div className='text-center'>
        <svg
          className='w-16 h-16 mx-auto text-green-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <h2 className='text-2xl font-bold mt-4 mb-2'>축하합니다!</h2>
        <p className='text-lg mb-6'>
          4단계 음성인식 말하기 연습을 완료했습니다.
        </p>
      </div>

      <div className='mb-8'>
        <h3 className='text-xl font-semibold mb-3'>학습 결과</h3>
        <p className='mb-4'>
          이제 문장을 보고 즉각적으로 영어로 말할 수 있는 능력이 향상되었습니다.
          음성 인식을 통해 본인의 발음과 문장 구성 능력도 확인했습니다.
        </p>
        <p className='mb-4'>
          학습한 내용을 정기적으로 복습하고, 실생활에서 활용해보세요.
        </p>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <Button onClick={handleRestart} variant='outline'>
          다시 학습하기
        </Button>
        <Button onClick={handleGoToLearn} variant='secondary'>
          학습 메뉴로
        </Button>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>4단계: 음성인식 말하기 연습</h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              {isCompleted ? (
                <CompletionResult />
              ) : (
                <>
                  <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))] mb-6'>
                    <h2 className='text-xl font-semibold mb-4'>말하기 연습</h2>
                    <p className='mb-4'>
                      한국어 문장을 보고 영어로 말해보세요. 음성 인식을 통해
                      발음과 문장 구성이 정확한지 확인합니다. 마이크 버튼을
                      클릭하여 말하기를 시작하세요.
                    </p>
                    <p className='mb-4 text-sm text-gray-600'>
                      각 문장은 정확히 말하거나, 3번 이상 시도하면 완료로
                      처리됩니다. 음성 인식이 잘 되지 않으면 더 크고 명확하게
                      발음하세요.
                    </p>

                    <Stage4Speaking
                      cards={cards}
                      onComplete={handleSpeakingComplete}
                      className='mt-6'
                    />
                  </div>

                  <div className='flex justify-between mt-4'>
                    <Button onClick={handleGoBack} variant='outline'>
                      이전 단계로
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
              <h2 className='text-xl font-semibold mb-4'>
                카드를 먼저 등록해주세요
              </h2>
              <p className='mb-4'>
                말하기 연습을 시작하기 전에 1단계에서 학습할 문장을
                등록해주세요.
              </p>
              <Button onClick={handleGoToStage1} variant='secondary'>
                1단계로 이동
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
