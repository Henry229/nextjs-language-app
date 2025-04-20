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
      className={`relative w-full max-w-md mx-auto h-48 perspective-1000 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* 카드 앞면 - 기본적으로 목표어(영어) */}
        <div
          className={`absolute w-full h-full backface-hidden bg-white rounded-xl shadow-md p-6 flex items-center justify-center ${
            isFlipped ? 'hidden' : ''
          }`}
        >
          <div className='text-center'>
            <p className='text-xl font-medium'>{card.target}</p>
            <p className='text-xs text-gray-500 mt-4'>클릭하여 뒤집기</p>
          </div>
        </div>

        {/* 카드 뒷면 - 모국어(한국어) */}
        <div
          className={`absolute w-full h-full backface-hidden bg-white rounded-xl shadow-md p-6 flex items-center justify-center transform rotate-y-180 ${
            isFlipped ? '' : 'hidden'
          }`}
        >
          <div className='text-center'>
            <p className='text-xl font-medium'>{card.native}</p>
            <p className='text-xs text-gray-500 mt-4'>클릭하여 뒤집기</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
