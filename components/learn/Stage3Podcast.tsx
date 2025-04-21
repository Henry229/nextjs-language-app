'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/types/card';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';
import Button from '@/components/ui/Button';

interface PodcastContent {
  context?: string;
  nativeExpressions?: string[];
  sampleConversation?: string;
  loading: boolean;
  error?: string;
}

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
  const [podcastContent, setPodcastContent] = useState<PodcastContent>({
    loading: false,
  });
  const [audioError, setAudioError] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('Jasper'); // UnrealSpeech 기본 음성

  // UnrealSpeech로 TTS 구현
  const {
    speak,
    stop,
    isSpeaking,
    error: ttsError,
  } = useUnrealSpeech({
    voice: voiceName,
    speed: playbackSpeed - 1, // UnrealSpeech의 speed는 -1에서 1 사이의 값을 가짐
    pitch: 1.0,
  });

  // 문장이 변경될 때마다 UnrealSpeech API 호출
  useEffect(() => {
    if (cards && cards.length > 0) {
      fetchPodcastContent(cards[currentIndex]);
    }
  }, [currentIndex, cards]);

  // UnrealSpeech API 호출하여 팟캐스트 콘텐츠 가져오기
  const fetchPodcastContent = useCallback(async (card: CardType) => {
    setPodcastContent({ loading: true });

    try {
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentence: card.target,
          nativeSentence: card.native,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '콘텐츠 생성 실패');
      }

      const data = await response.json();
      setPodcastContent({
        context: data.context,
        nativeExpressions: data.nativeExpressions,
        sampleConversation: data.sampleConversation,
        loading: false,
      });
    } catch (error) {
      console.error('팟캐스트 콘텐츠 가져오기 오류:', error);
      setPodcastContent({
        loading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 오디오 정리
      stop();
    };
  }, [stop]);

  // 사용자 상호작용 발생 시 오류 메시지 초기화
  const clearErrorOnUserInteraction = useCallback(() => {
    setAudioError(null);
  }, []);

  // 전체 팟캐스트 내용을 음성으로 재생할 텍스트로 준비
  const getPodcastText = useCallback(() => {
    if (
      !podcastContent.context &&
      !podcastContent.nativeExpressions &&
      !podcastContent.sampleConversation
    ) {
      return '';
    }

    let fullText = '';

    // Context 추가
    if (podcastContent.context) {
      fullText += podcastContent.context + '. ';
    }

    // Native Expressions 추가
    if (
      podcastContent.nativeExpressions &&
      podcastContent.nativeExpressions.length > 0
    ) {
      fullText += 'Native expressions: ';
      fullText += podcastContent.nativeExpressions.join('. ') + '. ';
    }

    // Sample Conversation 추가 (A:, B: 등 대화자 구분 제거)
    if (podcastContent.sampleConversation) {
      fullText += 'Conversation: ';
      // A:, B: 등 대화자 구분 제거
      const cleanedConversation = podcastContent.sampleConversation
        .replace(/^[A-Z]:\s*/gm, '') // 각 줄 시작의 "A: ", "B: " 등 제거
        .replace(/\n[A-Z]:\s*/g, '\n'); // 줄 중간의 대화자 구분도 제거

      fullText += cleanedConversation;
    }

    return fullText;
  }, [podcastContent]);

  // 음성 재생 함수 - 사용자 상호작용에 의해 호출됨
  const handlePlay = useCallback(async () => {
    clearErrorOnUserInteraction();

    // 이미 재생 중인 경우 중복 호출 방지
    if (isSpeaking) return;

    const podcastText = getPodcastText();
    if (podcastText) {
      try {
        await speak(podcastText);
      } catch (error) {
        console.error('팟캐스트 재생 오류:', error);
        setAudioError('음성 재생 중 오류가 발생했습니다.');
      }
    }
  }, [
    clearErrorOnUserInteraction,
    getPodcastText,
    isSpeaking,
    speak,
    setAudioError,
  ]);

  // 음성 중지 함수
  const handleStop = () => {
    clearErrorOnUserInteraction();
    stop();
  };

  const handleToggleTranslation = () => {
    clearErrorOnUserInteraction();
    setShowTranslation(!showTranslation);
  };

  const handlePrevious = () => {
    clearErrorOnUserInteraction();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
      stop();
    }
  };

  // 자동 재생 토글
  const handleToggleAutoPlay = () => {
    clearErrorOnUserInteraction();
    const newAutoPlayValue = !isAutoPlay;
    setIsAutoPlay(newAutoPlayValue);

    // 자동 재생 활성화 시 현재 문장부터 재생 시도
    if (newAutoPlayValue && !isSpeaking) {
      // 약간의 지연 후 재생 시도 (UI 업데이트 후)
      setTimeout(() => {
        handlePlay();
      }, 100);
    }
  };

  // 다음 버튼 처리
  const handleNext = useCallback(() => {
    clearErrorOnUserInteraction();

    const isLastCard = currentIndex === cards.length - 1;

    if (isLastCard) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // 현재 재생 중인 오디오 중지
    if (isSpeaking) {
      stop();
    }

    setCurrentIndex(currentIndex + 1);
    setShowTranslation(false);

    // 다음 콘텐츠를 가져올 때까지 기다린 후 재생 시도
    const nextCard = cards[currentIndex + 1];
    fetchPodcastContent(nextCard).then(() => {
      // 자동 재생이 활성화되어 있을 때만 재생
      if (isAutoPlay) {
        // 약간의 지연 후 재생 시도 (UI 업데이트 후)
        setTimeout(() => {
          handlePlay();
        }, 500);
      }
    });
  }, [
    currentIndex,
    cards,
    onComplete,
    isSpeaking,
    stop,
    isAutoPlay,
    setCurrentIndex,
    setShowTranslation,
    clearErrorOnUserInteraction,
    fetchPodcastContent,
    handlePlay,
  ]);

  // 자동 재생 처리
  useEffect(() => {
    // 자동 재생은 사용자가 명시적으로 활성화한 경우에만 작동
    if (isAutoPlay && !isSpeaking && currentIndex < cards.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2000); // 문장 사이에 2초 간격

      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isSpeaking, currentIndex, cards.length, handleNext]);

  // TTS 오류 처리
  useEffect(() => {
    if (ttsError) {
      setAudioError(ttsError);

      // 오류 발생 시 자동 재생 중지
      if (isAutoPlay) {
        setIsAutoPlay(false);
      }
    }
  }, [ttsError, isAutoPlay]);

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

  const handleSetPlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleRefreshContent = () => {
    clearErrorOnUserInteraction();
    if (currentCard) {
      fetchPodcastContent(currentCard);
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

        {/* 음성 재생 버튼 */}
        <div className='flex flex-wrap gap-2 mb-6'>
          {isSpeaking ? (
            <Button
              onClick={handleStop}
              variant='outline'
              disabled={!isSpeaking}
            >
              중지
            </Button>
          ) : (
            <Button
              onClick={handlePlay}
              variant='secondary'
              disabled={isSpeaking || !podcastContent.sampleConversation}
            >
              재생
            </Button>
          )}

          <Button onClick={handleToggleTranslation} variant='outline'>
            {showTranslation ? '번역 숨기기' : '번역 보기'}
          </Button>
        </div>

        {/* UnrealSpeech로 생성된 콘텐츠 */}
        <div className='mt-8 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold'>Podcast Learning</h3>
            <Button
              onClick={handleRefreshContent}
              variant='outline'
              className='text-xs'
              disabled={podcastContent.loading}
            >
              {podcastContent.loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {podcastContent.loading ? (
            <div className='py-4 text-center text-gray-500'>
              Generating podcast content...
            </div>
          ) : podcastContent.error ? (
            <div className='p-4 bg-red-50 text-red-500 rounded-md'>
              <p className='font-medium'>Error</p>
              <p className='text-sm'>{podcastContent.error}</p>
              <Button
                onClick={handleRefreshContent}
                variant='outline'
                className='mt-2 text-xs'
              >
                Try again
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* 문맥 정보 */}
              {podcastContent.context && (
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='font-medium mb-1'>Context:</p>
                  <p className='text-sm'>{podcastContent.context}</p>
                </div>
              )}

              {/* 네이티브 표현 */}
              {podcastContent.nativeExpressions &&
                podcastContent.nativeExpressions.length > 0 &&
                (() => {
                  // 로컬 변수에 할당하여 TypeScript 오류 방지
                  const expressions = podcastContent.nativeExpressions;
                  return (
                    <div className='bg-blue-50 rounded-lg p-4'>
                      <p className='font-medium mb-2'>Native Expressions:</p>
                      <div className='text-sm space-y-3'>
                        {expressions.map((expr, idx) => (
                          <div key={idx} className='podcast-expression'>
                            <p className='whitespace-pre-wrap leading-relaxed'>
                              {expr}
                            </p>
                            {idx !== expressions.length - 1 && (
                              <div className='my-2 border-b border-blue-100'></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* 샘플 대화 */}
              {podcastContent.sampleConversation && (
                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <p className='font-medium'>Sample Conversation:</p>
                  </div>
                  <pre className='text-sm whitespace-pre-wrap font-sans leading-relaxed'>
                    {podcastContent.sampleConversation}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 오디오 관련 오류 메시지 */}
        {audioError && (
          <div className='text-amber-600 text-sm mb-4 p-3 bg-amber-50 rounded border border-amber-200'>
            <div className='flex items-start'>
              <svg
                className='w-5 h-5 mr-2 mt-0.5 text-amber-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                ></path>
              </svg>
              <div>
                <p className='font-medium'>음성 재생 알림</p>
                <p className='mt-1 text-sm'>
                  음성 재생에 문제가 있습니다. 다시 시도해주세요.
                </p>
                <div className='mt-2 flex gap-2'>
                  <Button
                    onClick={clearErrorOnUserInteraction}
                    variant='outline'
                    className='text-xs py-1'
                  >
                    확인
                  </Button>
                  <Button
                    onClick={handleRefreshContent}
                    variant='outline'
                    className='text-xs py-1'
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 재생 상태 표시 */}
        {isSpeaking && (
          <div className='animate-pulse flex items-center gap-2 text-blue-500 text-sm mb-4'>
            <svg
              className='w-4 h-4'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z'
                clipRule='evenodd'
              />
            </svg>
            <span>
              <span className='font-medium text-blue-600'>UnrealSpeech</span>로
              재생 중...
            </span>
          </div>
        )}

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

        <div className='mb-4 text-sm text-gray-600'>
          사용 중인 음성: {voiceName}
        </div>

        <div className='mb-4'>
          <p className='font-medium mb-2'>Voice:</p>
          <div className='flex flex-wrap gap-2'>
            {['Jasper', 'Eleanor', 'Melody', 'Lauren', 'Luna'].map((voice) => (
              <Button
                key={voice}
                onClick={() => setVoiceName(voice)}
                variant={voiceName === voice ? 'secondary' : 'outline'}
                className='text-sm'
              >
                {voice}
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
