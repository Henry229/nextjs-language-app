'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/types/card';
import { Card } from './Card';
import Button from '@/components/ui/Button';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';

interface CardDeckProps {
  cards: CardType[];
  onCardStatusChange?: (cardId: number, newStatus: CardType['status']) => void;
  className?: string;
}

export function CardDeck({
  cards,
  onCardStatusChange,
  className = '',
}: CardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [shouldPlayNext, setShouldPlayNext] = useState(false);
  const { speak, isSpeaking, error } = useUnrealSpeech({
    apiKey:
      process.env.NEXT_PUBLIC_UNREALSPEECH_API_KEY ||
      process.env.UNREAL_SPEECH_API_KEY,
    voice: 'Jasper', // 남성 목소리: Jasper, Daniel, Oliver 등
    bitrate: '128k',
    speed: -0.2,
    pitch: 1.0,
  });

  // 현재 카드 정보 계산
  const currentCard = cards && cards.length > 0 ? cards[currentIndex] : null;
  const totalCards = cards ? cards.length : 0;

  // 이전 버튼 핸들러
  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setShouldPlayNext(true);
  }, []);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : prev));
    setShouldPlayNext(true);
  }, [totalCards]);

  // 카드 뒤집기 핸들러
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);

    // 카드가 앞면(영어)으로 뒤집을 때 자동으로 음성 재생
    if (isFlipped && autoPlayEnabled && currentCard) {
      speak(currentCard.target);
    }
  }, [isFlipped, autoPlayEnabled, currentCard, speak]);

  // 카드 상태 변경 핸들러
  const handleMarkStatus = useCallback(
    (status: CardType['status']) => {
      if (onCardStatusChange && currentCard) {
        onCardStatusChange(currentCard.id, status);
      }
      // 상태 변경 후 다음 카드로 이동
      handleNext();
    },
    [onCardStatusChange, currentCard, handleNext]
  );

  // 오디오 재생 핸들러
  const handlePlayAudio = useCallback(() => {
    if (currentCard) {
      speak(currentCard.target);
    }
  }, [currentCard, speak]);

  // 자동 재생 토글 핸들러
  const toggleAutoPlay = useCallback(() => {
    setAutoPlayEnabled((prev) => {
      const newState = !prev;
      if (newState) {
        // 자동 재생을 켜면 다음 카드에서부터 적용되도록 함
        setShouldPlayNext(false);
      }
      return newState;
    });
  }, []);

  // 카드가 변경되거나 플립될 때 자동 재생 처리
  useEffect(() => {
    // 자동 재생 로직에 오류 메시지가 있는지 확인
    // 오류가 있다면 자동 재생을 시도하지 않음
    if (error && error.includes('자동 재생')) {
      setShouldPlayNext(false);
      return;
    }

    if (
      shouldPlayNext &&
      autoPlayEnabled &&
      !isFlipped &&
      cards &&
      cards.length > 0 &&
      currentCard
    ) {
      // 경고: 이 부분은 브라우저 자동 재생 정책으로 인해 작동하지 않을 수 있음
      speak(currentCard.target).catch(() => {
        // 오류 발생 시 자동으로 처리됨 (useUnrealSpeech 내부에서)
        setShouldPlayNext(false);
      });
      setShouldPlayNext(false);
    }
  }, [
    currentIndex,
    isFlipped,
    shouldPlayNext,
    autoPlayEnabled,
    cards,
    currentCard,
    speak,
    error,
  ]);

  // 컴포넌트 마운트 시 첫 카드 자동 재생
  useEffect(() => {
    if (cards && cards.length > 0 && autoPlayEnabled) {
      setShouldPlayNext(true);
    }
  }, [cards, autoPlayEnabled]);

  // 카드가 없는 경우 처리
  if (!cards || cards.length === 0 || !currentCard) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          {currentIndex + 1} / {totalCards}
        </p>
      </div>

      <Card
        card={currentCard}
        showFront={!isFlipped}
        onFlip={handleFlip}
        className='mb-6'
      />

      <div className='text-center mb-4 flex justify-center gap-2'>
        <Button
          onClick={handlePlayAudio}
          variant='secondary'
          className='inline-flex items-center'
          disabled={isSpeaking}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='w-5 h-5 mr-2'
          >
            <path d='M11 5L6 9H2v6h4l5 4V5z'></path>
            <path d='M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07'></path>
          </svg>
          {isSpeaking ? '재생 중...' : '발음 듣기'}
        </Button>

        <Button
          onClick={toggleAutoPlay}
          variant={autoPlayEnabled ? 'outline' : 'outline'}
          className='inline-flex items-center'
        >
          {autoPlayEnabled ? '자동 재생 켜짐' : '자동 재생 꺼짐'}
        </Button>
      </div>

      {error && (
        <div className='text-red-500 text-sm text-center mb-4'>
          {error}
          {error.includes('자동 재생') && (
            <div className='mt-1'>
              <Button onClick={handlePlayAudio} variant='secondary' size='sm'>
                다시 재생 시도
              </Button>
            </div>
          )}
        </div>
      )}

      <div className='flex justify-between mt-6'>
        <Button
          onClick={handlePrevious}
          variant='outline'
          disabled={currentIndex === 0}
        >
          이전
        </Button>

        <div className='flex space-x-2'>
          <Button
            onClick={() => handleMarkStatus('learning')}
            variant='secondary'
          >
            다시 보기
          </Button>
          <Button
            onClick={() => handleMarkStatus('learned')}
            variant='secondary'
          >
            알고 있음
          </Button>
        </div>

        <Button
          onClick={handleNext}
          variant='outline'
          disabled={currentIndex === totalCards - 1}
        >
          다음
        </Button>
      </div>
    </div>
  );
}

export default CardDeck;
