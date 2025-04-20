'use client';

import { useState, useEffect } from 'react';
import { Card as CardType, CARD_STATUS } from '@/types/card';
import { CardDeck } from './CardDeck';
import Button from '@/components/ui/Button';

interface Stage2FlashcardsProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

export function Stage2Flashcards({
  cards: initialCards,
  onComplete,
  className = '',
}: Stage2FlashcardsProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [studyMode, setStudyMode] = useState<'all' | 'unseen' | 'learning'>(
    'all'
  );
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unseen: 0,
    learning: 0,
    learned: 0,
  });

  useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      setCards(initialCards);
    }
  }, [initialCards]);

  // 카드 상태에 따라 필터링하고 통계 업데이트
  useEffect(() => {
    const unseenCards = cards.filter(
      (card) => card.status === CARD_STATUS.UNSEEN
    );
    const learningCards = cards.filter(
      (card) => card.status === CARD_STATUS.LEARNING
    );
    const learnedCards = cards.filter(
      (card) => card.status === CARD_STATUS.LEARNED
    );

    setStats({
      total: cards.length,
      unseen: unseenCards.length,
      learning: learningCards.length,
      learned: learnedCards.length,
    });

    let filtered;
    switch (studyMode) {
      case 'unseen':
        filtered = unseenCards;
        break;
      case 'learning':
        filtered = learningCards;
        break;
      case 'all':
      default:
        filtered = cards;
        break;
    }

    setFilteredCards(filtered);
  }, [cards, studyMode]);

  const handleCardStatusChange = (
    cardId: number,
    newStatus: CardType['status']
  ) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );
  };

  const handleModeChange = (mode: 'all' | 'unseen' | 'learning') => {
    setStudyMode(mode);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (!cards || cards.length === 0) {
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
      <div className='mb-6'>
        <div className='flex flex-wrap gap-2 mb-4'>
          <Button
            onClick={() => handleModeChange('all')}
            variant={studyMode === 'all' ? 'secondary' : 'outline'}
          >
            전체 ({stats.total})
          </Button>
          <Button
            onClick={() => handleModeChange('unseen')}
            variant={studyMode === 'unseen' ? 'secondary' : 'outline'}
          >
            미학습 ({stats.unseen})
          </Button>
          <Button
            onClick={() => handleModeChange('learning')}
            variant={studyMode === 'learning' ? 'secondary' : 'outline'}
          >
            학습 중 ({stats.learning})
          </Button>
        </div>

        <div className='p-4 bg-gray-100 rounded-md mb-4'>
          <p className='font-medium'>학습 통계:</p>
          <p>
            학습 완료: {Math.round((stats.learned / stats.total) * 100)}% (
            {stats.learned}/{stats.total})
          </p>
        </div>
      </div>

      {filteredCards.length > 0 ? (
        <CardDeck
          cards={filteredCards}
          onCardStatusChange={handleCardStatusChange}
        />
      ) : (
        <div className='text-center p-8 bg-gray-100 rounded-md'>
          <p className='text-lg'>해당 카테고리에 카드가 없습니다.</p>
          <Button
            onClick={() => handleModeChange('all')}
            variant='secondary'
            className='mt-4'
          >
            전체 카드 보기
          </Button>
        </div>
      )}

      <div className='mt-8 text-center'>
        <Button onClick={handleComplete} variant='secondary'>
          학습 완료
        </Button>
      </div>
    </div>
  );
}

export default Stage2Flashcards;
