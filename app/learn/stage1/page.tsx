'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/types/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import CsvImport from '@/components/learn/CsvImport';
import Stage1Exercise from '@/components/learn/Stage1Exercise';
import Button from '@/components/ui/Button';

export default function Stage1Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategoryId = searchParams.get('subcategoryId');

  // Supabase 또는 로컬 스토리지에서 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    
    const loadCards = async () => {
      // subcategoryId가 있으면 Supabase에서 데이터 불러오기
      if (subcategoryId) {
        try {
          const supabase = createClientComponentClient<Database>();
          const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('created_at', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Supabase 데이터 형식을 Card 형식으로 변환
            const formattedCards: Card[] = data.map((item) => ({
              id: item.id,
              native: item.native_text, // 모국어(한국어)
              target: item.foreign_text, // 학습 언어(영어)
              status: 'unseen',
            }));
            
            setCards(formattedCards);
            // 로컬 스토리지에도 저장하여 다음 단계에서 사용할 수 있도록 함
            localStorage.setItem('learningCards', JSON.stringify(formattedCards));
            setIsLoading(false);
            // URL에서 subcategoryId가 있으면 바로 연습 시작
            setExerciseStarted(true);
            return;
          }
        } catch (error) {
          console.error('Supabase에서 카드 불러오기 실패:', error);
        }
      }
      
      // subcategoryId가 없거나 Supabase 로드 실패 시 로컬 스토리지에서 시도
      try {
        const savedCards = localStorage.getItem('learningCards');
        if (savedCards) {
          setCards(JSON.parse(savedCards));
        }
      } catch (error) {
        console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
      }
      
      setIsLoading(false);
    };
    
    loadCards();
  }, [subcategoryId]);

  // 카드 데이터 저장
  const handleCardsLoaded = (newCards: Card[]) => {
    setCards(newCards);
    try {
      localStorage.setItem('learningCards', JSON.stringify(newCards));
    } catch (error) {
      console.error('로컬 스토리지에 카드 저장 실패:', error);
    }
    setExerciseStarted(false);
  };

  // 영작 연습 시작
  const handleStartExercise = () => {
    setExerciseStarted(true);
  };

  // 영작 연습 완료
  const handleExerciseComplete = () => {
    alert('영작 연습을 완료했습니다! 다음 단계로 이동합니다.');
    router.push('/learn/stage2');
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>
        1단계: CSV 문장 입력 및 영작 연습
      </h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {!exerciseStarted ? (
            <div className='space-y-8'>
              <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
                <h2 className='text-xl font-semibold mb-4'>
                  1. CSV 파일 업로드
                </h2>
                <p className='mb-4'>
                  학습할 문장이 담긴 CSV 파일을 업로드하세요. 각 행은
                  &ldquo;영어 문장&rdquo;, &ldquo;한국어 번역&rdquo; 형식이어야
                  합니다.
                </p>
                <CsvImport onCardsLoaded={handleCardsLoaded} />
              </div>

              {cards.length > 0 && (
                <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
                  <h2 className='text-xl font-semibold mb-4'>
                    2. 영작 연습 시작
                  </h2>
                  <p className='mb-4'>
                    {cards.length}개의 문장이 준비되었습니다. 영작 연습을
                    시작하시겠습니까?
                  </p>
                  <Button onClick={handleStartExercise} variant='secondary'>
                    영작 연습 시작
                  </Button>
                </div>
              )}

              <div className='flex justify-between mt-8'>
                <Button onClick={handleGoBack} variant='outline'>
                  이전으로
                </Button>
              </div>
            </div>
          ) : (
            <Stage1Exercise
              cards={cards}
              onComplete={handleExerciseComplete}
              className='mt-4'
            />
          )}
        </>
      )}
    </div>
  );
}
