'use client';

import { useState } from 'react';
import { Card as CardType } from '@/types/card';
import { Card } from './Card';
import Button from '@/components/ui/Button';

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

  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : prev));
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkStatus = (status: CardType['status']) => {
    if (onCardStatusChange) {
      onCardStatusChange(currentCard.id, status);
    }
    // 상태 변경 후 다음 카드로 이동
    handleNext();
  };

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
