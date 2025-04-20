'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';
import Button from '@/components/ui/Button';

interface Stage3PodcastProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

export function Stage3Podcast({
  cards,
  onComplete,
  className = '',
}: Stage3PodcastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const { speak, isSpeaking, stop, setRate } = useTextToSpeech();

  // 재생 속도가 변경될 때마다 TTS 속도도 업데이트
  useEffect(() => {
    setRate(playbackSpeed);
  }, [playbackSpeed, setRate]);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 오디오 정리
      stop();
    };
  }, [stop]);

  // 자동 재생 처리
  useEffect(() => {
    if (isAutoPlay && !isSpeaking && currentIndex < cards.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2000); // 문장 사이에 2초 간격

      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isSpeaking, currentIndex, cards.length]);

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
  const isLastCard = currentIndex === totalCards - 1;

  const handlePlay = () => {
    speak(currentCard.target);
  };

  const handleStop = () => {
    stop();
  };

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
      stop();
    }
  };

  const handleNext = () => {
    if (isLastCard) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setShowTranslation(false);
    stop();

    // 자동 재생 모드라면 다음 문장도 재생
    if (isAutoPlay) {
      setTimeout(() => {
        speak(cards[currentIndex + 1].target);
      }, 500);
    }
  };

  const handleSetPlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleToggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);

    // 자동 재생 활성화 시 현재 문장부터 재생
    if (!isAutoPlay && !isSpeaking) {
      handlePlay();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          {currentIndex + 1} / {totalCards}
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
        <div className='mb-6'>
          <p className='font-medium mb-2'>영어 문장:</p>
          <p className='text-lg mb-4'>{currentCard.target}</p>

          {showTranslation && (
            <div className='p-4 bg-gray-100 rounded-md'>
              <p className='font-medium mb-1'>한국어 번역:</p>
              <p>{currentCard.native}</p>
            </div>
          )}
        </div>

        <div className='flex flex-wrap gap-2 mb-6'>
          {isSpeaking ? (
            <Button onClick={handleStop} variant='outline'>
              중지
            </Button>
          ) : (
            <Button onClick={handlePlay} variant='secondary'>
              재생
            </Button>
          )}

          <Button onClick={handleToggleTranslation} variant='outline'>
            {showTranslation ? '번역 숨기기' : '번역 보기'}
          </Button>
        </div>

        <div className='mb-6'>
          <p className='font-medium mb-2'>재생 속도:</p>
          <div className='flex flex-wrap gap-2'>
            {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
              <Button
                key={speed}
                onClick={() => handleSetPlaybackSpeed(speed)}
                variant={playbackSpeed === speed ? 'secondary' : 'outline'}
                className='text-sm'
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        <div className='flex justify-between items-center'>
          <Button
            onClick={handleToggleAutoPlay}
            variant={isAutoPlay ? 'secondary' : 'outline'}
          >
            {isAutoPlay ? '자동 재생 중지' : '자동 재생'}
          </Button>

          <div className='flex gap-2'>
            <Button
              onClick={handlePrevious}
              variant='outline'
              disabled={currentIndex === 0}
            >
              이전
            </Button>
            <Button onClick={handleNext} variant='secondary'>
              {isLastCard ? '완료' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stage3Podcast;
