'use client';

import { useState } from 'react';
import { Card as CardType } from '@/types/card';

interface CardProps {
  card: CardType;
  showFront?: boolean;
  onFlip?: () => void;
  className?: string;
}

export function Card({
  card,
  showFront = true,
  onFlip,
  className = '',
}: CardProps) {
  const [isFlipped, setIsFlipped] = useState(!showFront);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto h-48 cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 카드 앞면 - 기본적으로 목표어(영어) */}
        <div
          className={`absolute w-full h-full bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-xl shadow-md p-6 flex items-center justify-center border border-[hsl(var(--border))]`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className='text-center'>
            <p className='text-xl font-medium'>{card.target}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-4'>
              클릭하여 뒤집기
            </p>
          </div>
        </div>

        {/* 카드 뒷면 - 모국어(한국어) */}
        <div
          className={`absolute w-full h-full bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-xl shadow-md p-6 flex items-center justify-center border border-[hsl(var(--border))]`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className='text-center'>
            <p className='text-xl font-medium'>{card.native}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-4'>
              클릭하여 뒤집기
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
