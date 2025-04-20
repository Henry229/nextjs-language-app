'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';
import { checkSimilarity } from '@/lib/utils/csv-parser';
import Button from '@/components/ui/Button';

interface Stage4SpeakingProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

export function Stage4Speaking({
  cards,
  onComplete,
  className = '',
}: Stage4SpeakingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTargetText, setShowTargetText] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
  } = useSpeechRecognition({ language: 'en-US' });

  const { speak, isSpeaking } = useTextToSpeech();

  // transcript가 변경될 때마다 자동으로 정확도 체크
  useEffect(() => {
    if (transcript && currentCard && !isListening) {
      checkAccuracy();
    }
  }, [transcript, isListening]);

  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  if (!hasRecognitionSupport) {
    return (
      <div className='text-center p-8 bg-yellow-100 rounded-md'>
        <p className='text-lg'>
          현재 브라우저는 음성인식 기능을 지원하지 않습니다.
        </p>
        <p className='mt-2'>Chrome 브라우저를 사용해주세요.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const isLastCard = currentIndex === totalCards - 1;

  const handleListening = () => {
    resetTranscript();
    setFeedback(null);
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
    // 녹음 중지 시 자동으로 정확도를 체크
    if (transcript) {
      checkAccuracy();
    }
  };

  const handlePlayExample = () => {
    speak(currentCard.target);
  };

  const checkAccuracy = () => {
    if (!transcript || !currentCard) return;

    const isCorrect = checkSimilarity(transcript, currentCard.target);

    setFeedback({
      isCorrect,
      message: isCorrect
        ? '정확하게 말했습니다!'
        : '발음이 정확하지 않습니다. 다시 시도해보세요.',
    });

    if (isCorrect) {
      setCompletedCount((prev) => prev + 1);
    }
  };

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const handleToggleTargetText = () => {
    setShowTargetText(!showTargetText);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTranscript();
      setFeedback(null);
      setShowTranslation(false);
      setShowTargetText(false);
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
    resetTranscript();
    setFeedback(null);
    setShowTranslation(false);
    setShowTargetText(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          진행도: {currentIndex + 1} / {totalCards} (정확한 발음:{' '}
          {completedCount})
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <p className='font-medium'>한국어 문장:</p>
            <Button
              onClick={handleToggleTranslation}
              variant='outline'
              className='text-sm'
            >
              {showTranslation ? '번역 숨기기' : '번역 보기'}
            </Button>
          </div>
          <p className='text-lg mb-4'>{currentCard.native}</p>

          {showTranslation && (
            <div className='p-4 bg-gray-100 rounded-md mb-4'>
              <div className='flex justify-between items-center mb-1'>
                <p className='font-medium'>영어 문장:</p>
                <Button
                  onClick={handlePlayExample}
                  variant='outline'
                  className='text-sm'
                  disabled={isSpeaking}
                >
                  들어보기
                </Button>
              </div>
              {showTargetText ? (
                <p>{currentCard.target}</p>
              ) : (
                <Button
                  onClick={handleToggleTargetText}
                  variant='ghost'
                  className='text-sm'
                >
                  텍스트 보기
                </Button>
              )}
            </div>
          )}
        </div>

        <div className='mb-6'>
          <p className='font-medium mb-2'>말하기 연습:</p>
          <div className='p-4 bg-gray-100 rounded-md mb-4 min-h-[100px] relative'>
            {transcript ? (
              <p>{transcript}</p>
            ) : (
              <p className='text-gray-400'>
                {isListening
                  ? '말하는 중...'
                  : '버튼을 누르고 영어로 말해보세요.'}
              </p>
            )}

            {isListening && (
              <div className='absolute top-2 right-2 flex space-x-1'>
                <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>
                <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150'></span>
                <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse delay-300'></span>
              </div>
            )}
          </div>

          <div className='flex justify-center space-x-4'>
            {isListening ? (
              <Button
                onClick={handleStopListening}
                variant='outline'
                className='px-6'
              >
                멈추기
              </Button>
            ) : (
              <Button
                onClick={handleListening}
                variant='secondary'
                className='px-6'
              >
                말하기 시작
              </Button>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-md mb-6 ${
              feedback.isCorrect
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className='flex justify-between'>
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
  );
}

export default Stage4Speaking;
