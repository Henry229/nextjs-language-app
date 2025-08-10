'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card as CardType } from '@/types/card';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';

interface OpenAIResponse {
  conversation?: string;
  followUpQuestions?: string[];
  emotionalTone?: string;
  error?: string;
}

interface Stage3FreeConversationProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

export function Stage3FreeConversation({
  cards,
  onComplete,
  className = '',
}: Stage3FreeConversationProps) {
  // 기본 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [scenario, setScenario] = useState<{
    scenario: string;
    initialPrompt: string;
    vocabularyList: string[];
  } | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  >([]);
  const [userInput, setUserInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [learningContext, setLearningContext] = useState('');
  const [aiResponse, setAiResponse] = useState<OpenAIResponse | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [voiceName, setVoiceName] = useState('Jasper');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  const [error, setError] = useState<string | null>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  // TTS 기능
  const {
    speak,
    stop: stopSpeech,
    isSpeaking,
    error: ttsError,
  } = useUnrealSpeech({
    voice: voiceName,
  });

  // STT 기능
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    error: sttError,
    isSpeaking: isUserSpeaking,
  } = useSpeechRecognition({
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
    autoStop: true,
    silenceTimeout: 2000,
  });

  // 오류 처리 통합
  useEffect(() => {
    const newError = ttsError || sttError;
    if (newError) {
      setError(newError);
    }
  }, [ttsError, sttError]);

  // 카드에서 학습 컨텍스트 생성
  useEffect(() => {
    if (cards && cards.length > 0) {
      // 카드의 영어 문장을 모아서 학습 컨텍스트로 사용
      const learningPhrases = cards.map((card) => card.target).join('\n');
      setLearningContext(learningPhrases);
    }
  }, [cards]);

  // 시나리오 생성
  const generateConversationScenario = useCallback(async () => {
    if (!learningContext) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: learningContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '시나리오 생성 실패');
      }

      const data = await response.json();
      setScenario(data);

      // 초기 시스템 메시지 설정
      const initialSystemMessage = {
        role: 'system' as const,
        content: `Scenario: ${data.scenario}\n\nAI: ${data.initialPrompt}`,
      };

      setConversationHistory([initialSystemMessage]);

      // 초기 AI 메시지를 음성으로 읽어주기
      await speak(data.initialPrompt);
    } catch (error) {
      console.error('시나리오 생성 오류:', error);
      setError(
        error instanceof Error
          ? error.message
          : '시나리오를 생성하는 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [learningContext, speak]);

  // 대화 기록에서 이전 교환 내용 추출
  const getPreviousExchange = useCallback(() => {
    if (conversationHistory.length <= 1) return '';

    // 마지막 4개의 교환 내용만 포함 (시스템 메시지 제외)
    const exchanges = conversationHistory
      .filter((msg) => msg.role !== 'system')
      .slice(-4);

    return exchanges
      .map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');
  }, [conversationHistory]);

  // AI 응답 생성
  const generateAIResponse = useCallback(
    async (input: string) => {
      if (!input.trim()) return;

      setIsAiThinking(true);
      setError(null);

      try {
        const previousExchange = getPreviousExchange();

        const response = await fetch('/api/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: input,
            learningContext,
            previousExchange,
            nativeLanguage: 'Korean',
            targetLanguage: 'English',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'AI 응답 생성 실패');
        }

        const data = await response.json();
        setAiResponse(data);

        // 대화 기록에 사용자 입력 및 AI 응답 추가
        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: input },
          { role: 'assistant', content: data.conversation || '' },
        ]);

        // 음성으로 AI 응답 읽어주기
        if (data.conversation) {
          await speak(data.conversation);
        }
      } catch (error) {
        console.error('AI 응답 생성 오류:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'AI 응답을 생성하는 중 오류가 발생했습니다.'
        );
      } finally {
        setIsAiThinking(false);
      }
    },
    [getPreviousExchange, learningContext, speak]
  );

  // 음성 인식 시작
  const handleStartVoiceInput = useCallback(() => {
    resetTranscript();
    startListening();
    setError(null);
  }, [resetTranscript, startListening]);

  // 음성 인식 중지 및 입력 처리
  const handleStopVoiceInput = useCallback(() => {
    stopListening();
    if (transcript) {
      setUserInput(transcript);
      generateAIResponse(transcript);
    }
  }, [generateAIResponse, stopListening, transcript]);

  // 텍스트 입력 처리
  const handleTextInputSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!textInput.trim()) return;

      setUserInput(textInput);
      generateAIResponse(textInput);
      setTextInput('');
    },
    [generateAIResponse, textInput]
  );

  // 입력 모드 전환
  const toggleInputMode = useCallback(() => {
    if (inputMode === 'voice') {
      if (isListening) {
        stopListening();
      }
      setInputMode('text');
    } else {
      setInputMode('voice');
    }
  }, [inputMode, isListening, stopListening]);

  // 음성 읽기 중지
  const handleStopSpeaking = useCallback(() => {
    stopSpeech();
  }, [stopSpeech]);

  // 대화 다시 시작
  const handleRestartConversation = useCallback(() => {
    setConversationHistory([]);
    setAiResponse(null);
    setUserInput('');
    setTextInput('');
    resetTranscript();
    if (isListening) {
      stopListening();
    }
    if (isSpeaking) {
      stopSpeech();
    }
    generateConversationScenario();
  }, [
    generateConversationScenario,
    isListening,
    isSpeaking,
    resetTranscript,
    stopListening,
    stopSpeech,
  ]);

  // 완료 처리
  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // 컴포넌트 마운트 시 시나리오 생성
  useEffect(() => {
    if (learningContext) {
      generateConversationScenario();
    }
  }, [generateConversationScenario, learningContext]);

  // 대화 스크롤을 항상 최신 상태로 유지
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop =
        conversationContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // 음성 인식 결과 상태 업데이트
  useEffect(() => {
    if (inputMode === 'voice' && transcript) {
      setUserInput(transcript);
    }
  }, [inputMode, transcript]);

  // 음성 인식 지원 확인
  if (!hasRecognitionSupport && inputMode === 'voice') {
    return (
      <div className='text-center p-8 bg-yellow-100 rounded-md'>
        <p className='text-lg'>
          현재 브라우저는 음성인식 기능을 지원하지 않습니다.
        </p>
        <p className='mt-2'>Chrome 브라우저를 사용해주세요.</p>
        <Button
          onClick={() => setInputMode('text')}
          variant='secondary'
          className='mt-4'
        >
          텍스트 모드로 전환
        </Button>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. 먼저 학습할 문장을 등록해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>자유 대화</h2>
          <div className='space-x-2'>
            <Button
              onClick={toggleInputMode}
              variant='outline'
              className='text-sm'
            >
              {inputMode === 'voice' ? '텍스트 입력' : '음성 입력'}
            </Button>
            <Button
              onClick={handleRestartConversation}
              variant='outline'
              className='text-sm'
              disabled={isLoading}
            >
              대화 재시작
            </Button>
          </div>
        </div>

        {/* 시나리오 정보 */}
        {scenario && (
          <div className='bg-blue-50 p-4 rounded-lg mb-4'>
            <div className='font-medium mb-2'>대화 시나리오:</div>
            <p className='mb-2 text-sm'>{scenario.scenario}</p>
            {scenario.vocabularyList && scenario.vocabularyList.length > 0 && (
              <div className='mt-2'>
                <div className='font-medium text-sm'>주요 표현:</div>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {scenario.vocabularyList.map((word, idx) => (
                    <span
                      key={idx}
                      className='inline-block text-xs px-2 py-1 bg-blue-100 rounded'
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className='bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm'>
            {error}
          </div>
        )}

        {/* 대화 영역 */}
        <div
          ref={conversationContainerRef}
          className='border border-gray-200 rounded-lg h-96 overflow-y-auto mb-4 p-4 bg-white'
        >
          {isLoading ? (
            <div className='flex items-center justify-center h-full'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          ) : (
            <>
              {conversationHistory.length === 0 ? (
                <div className='text-center text-gray-500 mt-20'>
                  대화를 시작하려면 '대화 재시작' 버튼을 클릭하세요.
                </div>
              ) : (
                conversationHistory.map((message, index) => {
                  // 시스템 메시지(시나리오) 특별 처리
                  if (message.role === 'system' && index === 0) {
                    return (
                      <div
                        key={index}
                        className='bg-gray-100 p-3 rounded-lg mb-4 text-sm'
                      >
                        <div className='font-medium'>AI:</div>
                        <div className='mt-1'>
                          {scenario?.initialPrompt || message.content}
                        </div>
                      </div>
                    );
                  }

                  // 일반 대화 메시지
                  if (message.role === 'user') {
                    return (
                      <div
                        key={index}
                        className='p-3 rounded-lg mb-4 bg-blue-50 ml-8'
                      >
                        <div className='font-medium'>You:</div>
                        <div className='mt-1'>{message.content}</div>
                      </div>
                    );
                  }

                  if (message.role === 'assistant') {
                    return (
                      <div
                        key={index}
                        className='p-3 rounded-lg mb-4 bg-gray-100 mr-8'
                      >
                        <div className='font-medium'>AI:</div>
                        <div className='mt-1'>{message.content}</div>
                      </div>
                    );
                  }

                  return null;
                })
              )}

              {/* AI 생각 중 표시 */}
              {isAiThinking && (
                <div className='animate-pulse flex items-center gap-2 text-gray-400 p-3'>
                  <span className='text-sm'>AI is thinking</span>
                  <span className='inline-block w-1 h-1 bg-gray-400 rounded-full'></span>
                  <span className='inline-block w-1 h-1 bg-gray-400 rounded-full'></span>
                  <span className='inline-block w-1 h-1 bg-gray-400 rounded-full'></span>
                </div>
              )}
            </>
          )}
        </div>

        {/* 입력 영역 */}
        <div className='bg-white p-4 border border-gray-200 rounded-lg mb-4'>
          {inputMode === 'voice' ? (
            <div className='flex flex-col items-center space-y-4'>
              <div className='w-full p-4 bg-gray-50 rounded-lg min-h-16 text-center'>
                {isListening ? (
                  <div className='flex flex-col items-center'>
                    <div className='flex justify-center space-x-1 mb-2'>
                      <div
                        className={`w-2 h-8 bg-blue-500 rounded-full ${
                          isUserSpeaking ? 'animate-pulse' : ''
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-8 bg-blue-500 rounded-full ${
                          isUserSpeaking ? 'animate-pulse delay-75' : ''
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-8 bg-blue-500 rounded-full ${
                          isUserSpeaking ? 'animate-pulse delay-150' : ''
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-8 bg-blue-500 rounded-full ${
                          isUserSpeaking ? 'animate-pulse delay-300' : ''
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-8 bg-blue-500 rounded-full ${
                          isUserSpeaking ? 'animate-pulse delay-500' : ''
                        }`}
                      ></div>
                    </div>
                    <p className='text-sm'>
                      {isUserSpeaking
                        ? '말씀하세요...'
                        : '소리가 감지되지 않습니다'}
                    </p>
                    <p className='mt-2 text-gray-700'>{transcript}</p>
                  </div>
                ) : (
                  <p className='text-gray-500'>
                    마이크 버튼을 클릭하여 말하기를 시작하세요
                  </p>
                )}
              </div>

              <div className='flex space-x-4'>
                {isListening ? (
                  <Button
                    onClick={handleStopVoiceInput}
                    variant='outline'
                    className='px-6'
                  >
                    중지
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartVoiceInput}
                    variant='secondary'
                    className='px-6'
                    disabled={isAiThinking || isSpeaking}
                  >
                    마이크 켜기
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleTextInputSubmit} className='space-y-4'>
              <TextInput
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder='메시지를 입력하세요...'
                className='w-full'
              />
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  variant='secondary'
                  disabled={isAiThinking || isSpeaking}
                >
                  전송
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 음성 컨트롤 영역 */}
        <div className='flex justify-between items-center'>
          <div className='space-x-2'>
            {isSpeaking ? (
              <Button onClick={handleStopSpeaking} variant='outline'>
                음성 중지
              </Button>
            ) : (
              <div className='text-sm text-gray-500'>
                {scenario
                  ? '음성으로 대화를 이어나가세요'
                  : '대화를 시작하려면 대화 재시작 버튼을 클릭하세요'}
              </div>
            )}
          </div>

          <Button onClick={handleComplete} variant='secondary'>
            학습 완료
          </Button>
        </div>
      </div>

      {/* 추천 질문 영역 */}
      {aiResponse?.followUpQuestions && aiResponse.followUpQuestions.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-sm font-medium mb-2'>추천 질문:</h3>
          <div className='flex flex-wrap gap-2'>
            {aiResponse.followUpQuestions.map((question, idx) => (
              <button
                key={idx}
                className='text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
                onClick={() => {
                  if (inputMode === 'text') {
                    setTextInput(question);
                  } else {
                    setUserInput(question);
                    generateAIResponse(question);
                  }
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Stage3FreeConversation;
