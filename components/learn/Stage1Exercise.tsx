'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/types/card';
import { checkSimilarity } from '@/lib/utils/csv-parser';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';

interface Stage1ExerciseProps {
  cards: Card[];
  onComplete?: () => void;
  className?: string;
}

export function Stage1Exercise({
  cards,
  onComplete,
  className = '',
}: Stage1ExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

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

  const handleCheck = () => {
    const result = checkSimilarity(userInput, currentCard.target);
    const { isCorrect, similarity, missingWords, extraWords } = result;

    // 피드백 메시지 구성
    let message = '';
    if (isCorrect) {
      message = '정답입니다!';
    } else {
      message = '틀렸습니다. ';
      
      // 유사도에 따른 피드백
      if (similarity > 0.5) {
        message += '가까워지고 있어요! ';
      }
      
      // 누락된 단어가 있는 경우 피드백
      if (missingWords.length > 0) {
        message += `누락된 단어: ${missingWords.slice(0, 3).join(', ')}${missingWords.length > 3 ? '...' : ''} `;
      }
      
      message += '다시 시도하거나 정답을 확인하세요.';
    }

    setFeedback({
      isCorrect,
      message,
    });

    if (isCorrect) {
      setCompletedCount((prev) => prev + 1);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (isLastCard) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    // 입력이 변경되면 피드백과 정답 표시를 초기화
    setFeedback(null);
    setShowAnswer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          진행도: {currentIndex + 1} / {totalCards} (완료: {completedCount})
        </p>
      </div>

      <div className='bg-[hsl(var(--card))] rounded-xl shadow-md p-6 mb-6 border border-[hsl(var(--border))]'>
        <div className='mb-6'>
          <p className='font-medium mb-2'>한국어 문장:</p>
          <p className='text-lg'>{currentCard.native}</p>
        </div>

        <div className='mb-6'>
          <p className='font-medium mb-2'>영어로 작성해보세요:</p>
          <TextInput
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='영어 문장을 입력하세요...'
            className='w-full'
          />
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-md mb-4 ${
              feedback.isCorrect
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {showAnswer && (
          <div className='p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md mb-4'>
            <p className='font-medium'>정답:</p>
            <p>{currentCard.target}</p>
          </div>
        )}

        <div className='flex justify-between'>
          <div className='space-x-2'>
            <Button onClick={handleCheck} variant='secondary'>
              확인
            </Button>
            <Button onClick={handleShowAnswer} variant='outline'>
              정답 보기
            </Button>
          </div>

          <div className='space-x-2'>
            <Button onClick={handleSkip} variant='outline'>
              건너뛰기
            </Button>
            <Button
              onClick={handleNext}
              variant='secondary'
              disabled={!feedback?.isCorrect && !showAnswer}
            >
              {isLastCard ? '완료' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stage1Exercise;
