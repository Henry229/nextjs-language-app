'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/types/card';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';
import { checkSimilarity } from '@/lib/utils/csv-parser';
import Button from '@/components/ui/Button';

interface Stage4SpeakingProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

// 학습 진행 상태 인터페이스
interface CardProgress {
  cardId: number;
  attempts: number;
  isCompleted: boolean;
  lastSimilarity: number;
  lastAttemptTime?: number; // 마지막 시도 시간
}

// 피드백 인터페이스
interface Feedback {
  isCorrect: boolean;
  message: string;
  similarity: number;
  missingWords: string[];
  extraWords: string[];
}

// 로컬 스토리지 키
const STAGE4_PROGRESS_KEY = 'stage4Progress';
const REQUIRED_ATTEMPTS_FOR_COMPLETION = 3; // 학습 완료로 간주하기 위한 최소 시도 횟수

export function Stage4Speaking({
  cards,
  onComplete,
  className = '',
}: Stage4SpeakingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTargetText, setShowTargetText] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    isSpeaking: isUserSpeaking,
    confidence,
    error: recognitionError,
  } = useSpeechRecognition({
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
    autoStop: true,
    silenceTimeout: 2000,
  });

  const {
    speak,
    isSpeaking: isSystemSpeaking,
    error: speakError,
  } = useUnrealSpeech({
    apiKey: process.env.NEXT_PUBLIC_UNREALSPEECH_API_KEY,
    voice: 'Jasper', // 남성 목소리: Jasper, Daniel, Oliver 등
    bitrate: '128k',
    speed: -0.2,
    pitch: 1.0,
  });

  // 오류 처리 통합
  const error = recognitionError || speakError;

  // 현재 카드와 관련 상태 계산
  const currentCard = cards && cards.length > 0 ? cards[currentIndex] : null;
  const totalCards = cards ? cards.length : 0;
  const isLastCard = currentIndex === totalCards - 1;

  // 카드별 진행 상태 초기화 및 로컬 스토리지에서 불러오기
  useEffect(() => {
    if (cards && cards.length > 0) {
      try {
        // 로컬 스토리지에서 진행 상태 불러오기
        const savedProgress = localStorage.getItem(STAGE4_PROGRESS_KEY);

        if (savedProgress) {
          const parsedProgress: CardProgress[] = JSON.parse(savedProgress);

          // 카드 ID와 일치하는 진행 상태만 사용
          if (parsedProgress.length > 0) {
            // 기존 카드와 일치하는 진행 상태만 필터링
            const validProgress = parsedProgress.filter((progress) =>
              cards.some((card) => card.id === progress.cardId)
            );

            if (validProgress.length > 0) {
              setCardProgress(validProgress);

              // 완료된 카드 수 계산
              const completed = validProgress.filter(
                (p) => p.isCompleted
              ).length;
              setCompletedCount(completed);

              // 총 시도 횟수 계산
              const totalAttempts = validProgress.reduce(
                (sum, p) => sum + p.attempts,
                0
              );
              setAttemptCount(totalAttempts);

              console.log('4단계 진행 상태를 로드했습니다:', validProgress);
              return;
            }
          }
        }

        // 저장된 데이터가 없거나 유효하지 않은 경우 초기 상태 생성
        const initialProgress = cards.map((card) => ({
          cardId: card.id,
          attempts: 0,
          isCompleted: false,
          lastSimilarity: 0,
          lastAttemptTime: Date.now(),
        }));

        setCardProgress(initialProgress);
        console.log('새로운 4단계 진행 상태를 초기화했습니다.');
      } catch (error) {
        console.error('진행 상태 로드 중 오류:', error);

        // 오류 발생 시 초기 상태로 설정
        const initialProgress = cards.map((card) => ({
          cardId: card.id,
          attempts: 0,
          isCompleted: false,
          lastSimilarity: 0,
          lastAttemptTime: Date.now(),
        }));

        setCardProgress(initialProgress);
      }
    }
  }, [cards]);

  // 진행 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (cardProgress.length > 0) {
      try {
        localStorage.setItem(STAGE4_PROGRESS_KEY, JSON.stringify(cardProgress));
      } catch (error) {
        console.error('진행 상태 저장 중 오류:', error);
      }
    }
  }, [cardProgress]);

  // 현재 카드의 진행 상태
  const currentCardProgress = cardProgress.find(
    (p) => currentCard && p.cardId === currentCard.id
  );

  // 정확도 확인 함수
  const checkAccuracy = useCallback(() => {
    if (!transcript || !currentCard) return;

    const similarityResult = checkSimilarity(transcript, currentCard.target);
    const { isCorrect, similarity, missingWords, extraWords } =
      similarityResult;

    // 인식 신뢰도와 유사도를 고려한 피드백 메시지 생성
    let message = '';
    if (isCorrect) {
      if (similarity >= 0.95) {
        message = '완벽합니다! 발음과 문장이 정확합니다. 👏';
      } else if (similarity >= 0.85) {
        message = '훌륭합니다! 문장을 잘 전달했습니다. 👍';
      } else {
        message = '좋습니다! 핵심 내용을 전달했습니다. ✓';
      }
    } else {
      if (similarity >= 0.7) {
        message = '거의 정확합니다! 일부 단어가 다르거나 빠졌습니다.';
      } else if (similarity >= 0.5) {
        message = '부분적으로 정확합니다. 다시 시도해보세요.';
      } else if (confidence < 0.6) {
        message =
          '음성 인식이 잘 되지 않았습니다. 더 크고 명확하게 발음해보세요.';
      } else {
        message = '다시 시도해보세요. 문장이 많이 다릅니다.';
      }
    }

    // 피드백 설정
    setFeedback({
      isCorrect,
      message,
      similarity,
      missingWords,
      extraWords,
    });

    // 카드 진행 상태 업데이트
    setCardProgress((prev) => {
      const newProgress = [...prev];
      const currentCardIndex = newProgress.findIndex(
        (p) => currentCard && p.cardId === currentCard.id
      );

      if (currentCardIndex >= 0) {
        const card = newProgress[currentCardIndex];
        card.attempts += 1;
        card.lastSimilarity = similarity;
        card.lastAttemptTime = Date.now();

        // 완료 조건: 정확하게 말했거나, 특정 횟수 이상 시도했으며 어느 정도 유사도가 있는 경우
        const isCompletedNow =
          isCorrect ||
          (card.attempts >= REQUIRED_ATTEMPTS_FOR_COMPLETION &&
            similarity >= 0.5);

        // 이미 완료된 상태가 아니고, 현재 완료 조건을 충족한 경우에만 완료 상태 업데이트
        if (!card.isCompleted && isCompletedNow) {
          card.isCompleted = true;
          setCompletedCount((prev) => prev + 1);
        }
      }

      return newProgress;
    });

    // 전체 시도 횟수 증가
    setAttemptCount((prev) => prev + 1);
  }, [transcript, currentCard, confidence]);

  // 시작 버튼 핸들러
  const handleListening = useCallback(() => {
    resetTranscript();
    setFeedback(null);
    startListening();
  }, [resetTranscript, startListening]);

  // 중지 버튼 핸들러
  const handleStopListening = useCallback(() => {
    stopListening();
    if (transcript) {
      checkAccuracy();
    }
  }, [stopListening, transcript, checkAccuracy]);

  // 예제 재생 핸들러
  const handlePlayExample = useCallback(() => {
    if (currentCard) {
      speak(currentCard.target);
    }
  }, [currentCard, speak]);

  // 번역 토글 핸들러
  const handleToggleTranslation = useCallback(() => {
    setShowTranslation((prev) => !prev);
  }, []);

  // 텍스트 표시 토글 핸들러
  const handleToggleTargetText = useCallback(() => {
    setShowTargetText((prev) => !prev);
  }, []);

  // 이전 버튼 핸들러
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTranscript();
      setFeedback(null);
      setShowTranslation(false);
      setShowTargetText(false);
    }
  }, [currentIndex, resetTranscript]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
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
  }, [currentIndex, isLastCard, onComplete, resetTranscript]);

  // transcript가 변경될 때마다 자동으로 정확도 체크
  useEffect(() => {
    if (transcript && currentCard && !isListening) {
      checkAccuracy();
    }
  }, [transcript, isListening, checkAccuracy, currentCard]);

  // 전체 학습 진행률 계산 (PRD 요구사항: 일정 수준 이상 정확도로 말하기 성공 또는 일정 횟수 이상 시도)
  const progressPercentage =
    totalCards > 0 ? (completedCount / totalCards) * 100 : 0;

  // 카드가 없는 경우 처리
  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  // 음성 인식 미지원 브라우저 처리
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

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          진행도: {currentIndex + 1} / {totalCards} (완료한 문장:{' '}
          {completedCount}, 총 시도: {attemptCount})
        </p>
        <div className='w-full h-2 bg-gray-200 rounded-full mt-2'>
          <div
            className='h-full bg-green-500 rounded-full'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className='p-4 mb-4 text-sm text-red-500 bg-red-100 rounded-md'>
          음성 서비스 오류: {error}
        </div>
      )}

      <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <p className='font-medium'>한국어 문장:</p>
            <div className='flex space-x-2'>
              <Button
                onClick={handleToggleTranslation}
                variant='outline'
                className='text-sm'
              >
                {showTranslation ? '번역 숨기기' : '번역 보기'}
              </Button>
              {currentCardProgress && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentCardProgress.isCompleted
                      ? 'bg-green-100 text-green-800'
                      : currentCardProgress.attempts > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currentCardProgress.isCompleted
                    ? '완료'
                    : currentCardProgress.attempts > 0
                    ? `시도: ${currentCardProgress.attempts}`
                    : '미시도'}
                </span>
              )}
            </div>
          </div>
          <p className='text-lg mb-4'>{currentCard?.native}</p>

          {showTranslation && (
            <div className='p-4 bg-gray-100 rounded-md mb-4'>
              <div className='flex justify-between items-center mb-1'>
                <p className='font-medium'>영어 문장:</p>
                <Button
                  onClick={handlePlayExample}
                  variant='outline'
                  className='text-sm'
                  disabled={isSystemSpeaking}
                >
                  들어보기
                </Button>
              </div>
              {showTargetText ? (
                <p>{currentCard?.target}</p>
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
                  ? isUserSpeaking
                    ? '말하는 중...'
                    : '소리가 감지되지 않습니다. 말씀해주세요.'
                  : '버튼을 누르고 영어로 말해보세요.'}
              </p>
            )}

            {isListening && (
              <div className='absolute top-2 right-2 flex items-center'>
                <div className='flex space-x-1 mr-2'>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking
                        ? 'bg-red-500 animate-pulse delay-150'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking
                        ? 'bg-red-500 animate-pulse delay-300'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                </div>
                {confidence > 0 && (
                  <span className='text-xs text-gray-500'>
                    {Math.round(confidence * 100)}%
                  </span>
                )}
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
                : feedback.similarity >= 0.5
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <div className='font-medium mb-1'>{feedback.message}</div>

            {!feedback.isCorrect && (
              <div className='mt-2'>
                {feedback.missingWords.length > 0 && (
                  <div className='text-sm'>
                    <span className='font-medium'>빠진 단어:</span>{' '}
                    {feedback.missingWords.join(', ')}
                  </div>
                )}
                {feedback.extraWords.length > 0 && (
                  <div className='text-sm'>
                    <span className='font-medium'>추가된 단어:</span>{' '}
                    {feedback.extraWords.join(', ')}
                  </div>
                )}
                <div className='mt-2 text-sm flex items-center'>
                  <span className='font-medium mr-2'>정확도:</span>
                  <div className='w-24 h-2 bg-gray-300 rounded-full'>
                    <div
                      className={`h-full rounded-full ${
                        feedback.similarity >= 0.8
                          ? 'bg-green-500'
                          : feedback.similarity >= 0.5
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${feedback.similarity * 100}%` }}
                    ></div>
                  </div>
                  <span className='ml-2'>
                    {Math.round(feedback.similarity * 100)}%
                  </span>
                </div>

                {!showTargetText && (
                  <div className='mt-3'>
                    <Button
                      onClick={handleToggleTargetText}
                      variant='outline'
                      className='text-xs'
                    >
                      정답 보기
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 정답이거나 여러 번 시도했을 때 다음 문장으로 유도 */}
            {(feedback.isCorrect ||
              (currentCardProgress &&
                currentCardProgress.attempts >=
                  REQUIRED_ATTEMPTS_FOR_COMPLETION)) &&
              !isLastCard && (
                <div className='mt-3'>
                  <Button
                    onClick={handleNext}
                    variant='outline'
                    className='text-xs'
                  >
                    다음 문장으로
                  </Button>
                </div>
              )}
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
