'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/types/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Stage3FreeConversation from '@/components/learn/Stage3FreeConversation';
import Button from '@/components/ui/Button';

export default function Stage3Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
            // 로컬 스토리지에도 저장하여 사용할 수 있도록 함
            localStorage.setItem('learningCards', JSON.stringify(formattedCards));
            setIsLoading(false);
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

  const handleConversationComplete = () => {
    // 학습 완료 시 로컬 스토리지에 저장
    try {
      localStorage.setItem('stage3Completed', 'true');
      alert('자유 대화 학습을 완료했습니다! 모든 단계를 성공적으로 마쳤습니다.');
      router.push('/learn');
    } catch (error) {
      console.error('학습 완료 상태 저장 실패:', error);
    }
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn/stage2');
  };

  // 카드가 없는 경우의 처리
  const handleGoToStage1 = () => {
    router.push('/learn/stage1');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>
        3단계: 상황극 기반 자유 대화
      </h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))] mb-6'>
                <h2 className='text-xl font-semibold mb-4'>
                  OpenAI 통합 대화 연습
                </h2>
                <p className='mb-4'>
                  이전 단계에서 학습한 문장을 바탕으로 자연스러운 대화 시나리오를
                  생성하여 자유롭게 대화를 연습할 수 있습니다. 음성이나 텍스트로
                  대화에 참여해보세요.
                </p>

                <Stage3FreeConversation
                  cards={cards}
                  onComplete={handleConversationComplete}
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
                자유 대화 학습을 시작하기 전에 1단계에서 학습할 문장을
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
