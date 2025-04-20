'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/types/card';
import Stage2Flashcards from '@/components/learn/Stage2Flashcards';
import Button from '@/components/ui/Button';

export default function Stage2Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 로컬 스토리지에서 저장된 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCards = localStorage.getItem('learningCards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    } catch (error) {
      console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
    }
    setIsLoading(false);
  }, []);

  const handleFlashcardsComplete = () => {
    alert('플래시 카드 학습을 완료했습니다! 다음 단계로 이동합니다.');
    router.push('/learn/stage3');
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn/stage1');
  };

  // 카드가 없는 경우의 처리
  const handleGoToStage1 = () => {
    router.push('/learn/stage1');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>2단계: 플래시 카드 학습</h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))] mb-6'>
                <h2 className='text-xl font-semibold mb-4'>플래시 카드 학습</h2>
                <p className='mb-4'>
                  카드를 클릭하여 앞면/뒷면을 전환할 수 있습니다. 카드의 앞면은
                  한국어, 뒷면은 영어입니다. 카드를 학습한 후 '다시 보기' 또는
                  '알고 있음' 버튼을 선택하여 학습 상태를 기록하세요.
                </p>

                <Stage2Flashcards
                  cards={cards}
                  onComplete={handleFlashcardsComplete}
                  className='mt-6'
                />
              </div>

              <div className='flex justify-between mt-4'>
                <Button onClick={handleGoBack} variant='outline'>
                  이전 단계로
                </Button>
              </div>
            </>
          ) : (
            <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
              <h2 className='text-xl font-semibold mb-4'>
                카드를 먼저 등록해주세요
              </h2>
              <p className='mb-4'>
                플래시 카드 학습을 시작하기 전에 1단계에서 학습할 문장을
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
