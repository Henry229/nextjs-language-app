'use client'; // Add this directive for client-side interactivity (hooks)

import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Constants ---
const STAGES = {
  LOAD: 'load',
  STAGE1: 'stage1',
  STAGE2: 'stage2',
  STAGE3: 'stage3',
} as const;

const CARD_STATUS = {
  UNSEEN: 'unseen',
  LEARNING: 'learning',
  LEARNED: 'learned',
} as const;

const SENDER = {
  USER: 'user',
  AI: 'ai',
} as const;

// --- Types ---
type StageType = (typeof STAGES)[keyof typeof STAGES];
type CardStatusType = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];
type SenderType = (typeof SENDER)[keyof typeof SENDER];

interface Card {
  id: number;
  native: string;
  target: string;
  status: CardStatusType;
}

interface Message {
  sender: SenderType;
  text: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Register SpeechRecognition types globally
declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

// --- Helper Functions ---
const parseCsvData = (textData: string | null): Card[] => {
  if (!textData || typeof textData !== 'string') return [];
  return textData
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      let parts;
      if (line.includes('\t')) parts = line.split('\t');
      else parts = line.split(',');
      if (parts.length >= 2) {
        const nativeLang = parts[0].trim().replace(/^"|"$/g, '').trim();
        const targetLang = parts[1].trim().replace(/^"|"$/g, '').trim();
        if (nativeLang && targetLang) {
          return {
            id: index,
            native: nativeLang,
            target: targetLang,
            status: CARD_STATUS.UNSEEN as CardStatusType,
          };
        }
      }
      return null;
    })
    .filter((item): item is Card => item !== null);
};

const checkSimilarity = (text1: string, text2: string): boolean => {
  if (!text1 || !text2) return false;
  const normalize = (str: string): string =>
    str
      .toLowerCase()
      .replace(/[.,!?'"]/g, '')
      .trim();
  return normalize(text1) === normalize(text2);
};

// --- Main Page Component ---
export default function LanguageLearningPage() {
  // Changed component name
  // --- State Variables ---
  const [currentStage, setCurrentStage] = useState<StageType>(STAGES.LOAD);
  const [textInput, setTextInput] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [error, setError] = useState<string>(''); // General/TTS errors
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isTTSLoading, setIsTTSLoading] = useState<boolean>(false);

  // STT State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [sttTranscript, setSttTranscript] = useState<string>('');
  const [sttError, setSttError] = useState<string>(''); // STT specific errors
  const [sttFeedback, setSttFeedback] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Stage 3 State
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Effects ---

  // Initialize/Cleanup STT
  useEffect(() => {
    // Initialize STT only if needed and supported
    if (
      currentStage !== STAGES.LOAD &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      // Initialize instance only once
      if (!recognitionRef.current && SpeechRecognitionAPI) {
        console.log('STT: Initializing SpeechRecognition instance.');
        recognitionRef.current = new SpeechRecognitionAPI();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.lang = 'en-US'; // Target language for STT
          recognitionRef.current.interimResults = false;
        }
      }

      const recognition = recognitionRef.current;

      if (recognition) {
        // Assign event handlers (ensure they are not duplicated)
        recognition.onstart = () => {
          console.log('STT: Recognition started');
          setIsListening(true);
          setSttTranscript('');
          setSttError('');
          setSttFeedback('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          console.log('STT: Result received - ', transcript);
          setSttTranscript(transcript);

          if (currentStage === STAGES.STAGE2) {
            /* ... Stage 2 comparison logic ... */
            if (cards.length > 0 && cards[currentIndex]) {
              const currentCard = cards[currentIndex];
              const isCorrect = checkSimilarity(transcript, currentCard.target);
              setSttFeedback(
                isCorrect
                  ? `정답! "${transcript}"`
                  : `다시 시도해보세요. 인식된 내용: "${transcript}"`
              );
              if (isCorrect) {
                updateCardStatus(currentCard.id, CARD_STATUS.LEARNED);
              }
            }
          } else if (currentStage === STAGES.STAGE3) {
            /* ... Stage 3 chat logic ... */
            console.log('STT: Sending transcript to conversation in Stage 3.');
            addMessageToConversation(SENDER.USER, transcript);
            getAiResponse(transcript); // Trigger AI response
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('STT: Full Recognition Error Event:', event);
          let errorMessage = `음성 인식 오류: ${event.error}`;
          if (event.message) {
            errorMessage += ` (${event.message})`;
          }
          setSttError(errorMessage);
          setIsListening(false); // Ensure listening state is reset on error
        };

        recognition.onend = () => {
          console.log('STT: Recognition ended');
          setIsListening(false);
        };
      }
    } else if (currentStage !== STAGES.LOAD) {
      // Handle unsupported browser only if STT is relevant for the stage
      if (currentStage === STAGES.STAGE2 || currentStage === STAGES.STAGE3) {
        setSttError('이 브라우저에서는 음성 인식을 지원하지 않습니다.');
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        console.log('STT: Cleaning up recognition instance.');
        try {
          recognitionRef.current.abort(); // Use abort for immediate stop
          // Remove listeners explicitly (important for some browsers/versions)
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        } catch (e) {
          console.error('STT: Error during cleanup:', e);
        }
      }
      // Stop audio playback on cleanup
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
    // Dependencies: Re-run when stage changes to setup/cleanup STT
  }, [currentStage]); // Removed cards/currentIndex as STT handlers access state directly

  // Auto-scroll chat container
  useEffect(() => {
    if (currentStage === STAGES.STAGE3 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation, currentStage]);

  // --- Event Handlers & Logic ---

  const handleLoadCards = () => {
    setError('');
    setSttError('');
    const parsedCards = parseCsvData(textInput);
    if (parsedCards.length === 0) {
      setError('유효한 카드 데이터를 찾을 수 없습니다. 형식을 확인하세요.');
      setCards([]);
      setCurrentStage(STAGES.LOAD);
    } else {
      setCards(parsedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setConversation([]);
      setUserInput('');
      setIsAiResponding(false); // Reset Stage 3
      setCurrentStage(STAGES.STAGE1);
      console.log('Loaded cards:', parsedCards);
    }
  };
  const handleFlipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // --- TTS Function - Calls Next.js API Route /api/tts ---
  const speakText = useCallback(async (text: string) => {
    if (!text) {
      console.warn('TTS: No text provided.');
      return;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
    }

    console.log(`TTS: Requesting speech via API route for "${text}"`);
    setIsTTSLoading(true);
    setError('');

    try {
      // Fetch audio from the Next.js API route
      const response = await fetch('/api/tts', {
        // Relative path works within Next.js
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voiceId: 'Sierra', // Example voice
        }),
      });

      if (!response.ok) {
        let errorMsg = `API TTS request failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          /* Ignore if response not JSON */
        }
        throw new Error(errorMsg);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        await audioPlayerRef.current.play();
        console.log('TTS: Audio playback started via API route.');
      } else {
        console.error('TTS: Audio player element not found.');
      }
    } catch (error) {
      console.error('TTS: Error calling API route or playing audio:', error);
      setError(`TTS 오류: ${(error as Error).message}`);
    } finally {
      setIsTTSLoading(false);
    }
  }, []);

  // Effect to trigger speakText on card flip
  useEffect(() => {
    if (
      currentStage === STAGES.STAGE1 &&
      isFlipped &&
      cards.length > 0 &&
      cards[currentIndex]
    ) {
      speakText(cards[currentIndex].target);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    }
  }, [currentStage, isFlipped, currentIndex, cards, speakText]); // speakText added

  const navigateCard = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < cards.length) {
      setCurrentIndex(newIndex);
      setIsFlipped(false);
      setSttTranscript('');
      setSttFeedback('');
      setSttError('');
      setError('');
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      // Abort STT if listening
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        setIsListening(false); // Reset listening state
      }
      if (
        currentStage === STAGES.STAGE1 &&
        cards[newIndex]?.status === CARD_STATUS.UNSEEN
      ) {
        updateCardStatus(cards[newIndex].id, CARD_STATUS.LEARNING);
      }
    }
  };

  const updateCardStatus = (cardId: number, newStatus: CardStatusType) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );
    console.log(`Card ${cardId} status updated to ${newStatus}`);
  };

  // --- Stage 3: Chat Logic ---
  const addMessageToConversation = (sender: SenderType, text: string) => {
    setConversation((prev) => [...prev, { sender, text }]);
  };

  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = userInput.trim();
    if (text && !isAiResponding) {
      addMessageToConversation(SENDER.USER, text);
      setUserInput('');
      getAiResponse(text);
    }
  };

  // --- Calls Next.js API Route /api/chat ---
  const getAiResponse = useCallback(
    async (userMessage: string) => {
      console.log('AI: Sending user message to API route:', userMessage);
      setIsAiResponding(true);
      setError('');

      const history = conversation.map((msg) => ({
        role: msg.sender === SENDER.USER ? 'user' : 'assistant',
        content: msg.text,
      }));
      history.push({ role: 'user', content: userMessage });

      try {
        // Fetch AI response from the Next.js API route
        const response = await fetch('/api/chat', {
          // Relative path
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) {
          let errorMsg = `API Chat request failed: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch {
            /* Ignore if response not JSON */
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const aiResponseText = data.reply;

        if (aiResponseText) {
          console.log('AI: Received response from API route:', aiResponseText);
          addMessageToConversation(SENDER.AI, aiResponseText);
          speakText(aiResponseText); // Speak the response
        } else {
          throw new Error('API로부터 유효한 AI 응답을 받지 못했습니다.');
        }
      } catch (error) {
        console.error('AI: Error fetching response from API route:', error);
        setError(`AI 대화 오류: ${(error as Error).message}`);
        addMessageToConversation(
          SENDER.AI,
          '죄송합니다. 응답 생성 중 오류가 발생했습니다.'
        );
      } finally {
        setIsAiResponding(false);
      }
    },
    [conversation, speakText]
  ); // Dependencies

  // STT Handlers
  const handleStartListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setSttError('');
        setSttTranscript('');
        setSttFeedback('');
        setError('');
        recognitionRef.current.start();
      } catch (err) {
        console.error('STT: Error caught during recognition.start():', err);
        let specificError = `음성 인식을 시작할 수 없습니다. (${
          err instanceof Error ? err.name : 'Unknown Error'
        })`;
        if (err instanceof Error && err.name === 'NotAllowedError') {
          specificError = '마이크 권한이 거부되었습니다.';
        }
        setSttError(specificError);
        setIsListening(false);
      }
    } else if (!recognitionRef.current) {
      setSttError('이 브라우저에서는 음성 인식을 지원하지 않습니다.');
    } else if (isListening) {
      console.log('STT: Recognition is already active.');
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('STT: Error stopping recognition manually:', e);
        setIsListening(false);
      }
    }
  };

  // Navigation and Reset
  const goToStage = (stage: StageType) => {
    if (currentStage !== stage) {
      console.log(`Navigating to Stage ${stage}`);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSttTranscript('');
      setSttFeedback('');
      setSttError('');
      setError('');
      // Stop ongoing activities
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        setIsListening(false);
      }
      // Initialize conversation for Stage 3 if entering it
      if (stage === STAGES.STAGE3 && conversation.length === 0) {
        addMessageToConversation(
          SENDER.AI,
          '안녕하세요! 자유롭게 대화를 시작해 보세요.'
        );
      }
      setCurrentStage(stage);
    }
  };

  const handleResetApp = () => {
    console.log('Resetting application state to LOAD stage.');
    // Stop activities
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
    }
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }
    // Reset state
    setTextInput('');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setError('');
    setIsTTSLoading(false);
    setIsListening(false);
    setSttTranscript('');
    setSttError('');
    setSttFeedback('');
    setConversation([]);
    setUserInput('');
    setIsAiResponding(false);
    setCurrentStage(STAGES.LOAD);
  };

  // Calculated Values
  const currentCard = cards.length > 0 ? cards[currentIndex] : null;
  const learnedCount = cards.filter(
    (c) => c.status === CARD_STATUS.LEARNED
  ).length;
  const progressPercent =
    cards.length > 0 ? Math.round((learnedCount / cards.length) * 100) : 0;

  // --- Render Logic ---
  // The JSX structure remains largely the same as the previous version
  // Ensure Tailwind CSS is set up in your Next.js project
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 font-sans text-gray-800'>
      {/* Audio player for TTS */}
      <audio
        ref={audioPlayerRef}
        style={{ display: 'none' }}
        aria-hidden='true'
      />

      <div className='w-full max-w-2xl'>
        {' '}
        {/* Increased max width slightly */}
        {/* Header Area */}
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-3xl font-bold'>언어 학습 앱</h1>
          {currentStage !== STAGES.LOAD && (
            <button
              onClick={handleResetApp}
              className='bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md transition duration-150 shadow-sm'
              title='모든 데이터 지우고 처음으로 돌아가기'
            >
              초기화
            </button>
          )}
        </div>
        {/* Stage: Load Data */}
        {currentStage === STAGES.LOAD && (
          <div className='w-full mb-6 bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold text-gray-700 mb-3'>
              학습 내용 입력 (CSV 또는 탭 구분)
            </h2>
            <textarea
              className='w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              placeholder='쉼표(,) 또는 탭으로 구분된 데이터를 붙여넣으세요. 예:&#10;안녕하세요,Hello&#10;감사합니다    Thank you (탭으로 구분)'
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              aria-label='학습 내용 입력'
            />
            <button
              onClick={handleLoadCards}
              className='mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            >
              학습 시작 (1단계)
            </button>
            {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
          </div>
        )}
        {/* Stages 1, 2 & 3 Container */}
        {currentStage !== STAGES.LOAD && cards.length > 0 && (
          <div className='w-full bg-white p-6 rounded-lg shadow-md'>
            {/* Stage Tabs / Header */}
            <div className='flex flex-wrap justify-between items-center mb-4 border-b pb-2 gap-2'>
              <div className='flex-shrink-0'>
                <button
                  onClick={() => goToStage(STAGES.STAGE1)}
                  className={`px-3 py-1 rounded-md mr-1 text-xs sm:text-sm transition-colors ${
                    currentStage === STAGES.STAGE1
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  aria-pressed={currentStage === STAGES.STAGE1}
                >
                  1단계: 카드
                </button>
                <button
                  onClick={() => goToStage(STAGES.STAGE2)}
                  className={`px-3 py-1 rounded-md mr-1 text-xs sm:text-sm transition-colors ${
                    currentStage === STAGES.STAGE2
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  aria-pressed={currentStage === STAGES.STAGE2}
                >
                  2단계: 말하기
                </button>
                <button
                  onClick={() => goToStage(STAGES.STAGE3)}
                  className={`px-3 py-1 rounded-md text-xs sm:text-sm transition-colors ${
                    currentStage === STAGES.STAGE3
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  aria-pressed={currentStage === STAGES.STAGE3}
                >
                  3단계: 대화
                </button>
              </div>
              <div className='text-sm text-gray-600 flex-shrink-0'>
                진행률: {progressPercent}% ({learnedCount}/{cards.length})
              </div>
            </div>
            {/* Display general/TTS errors */}
            {error && (
              <p className='text-red-500 text-sm mb-2 text-center'>{error}</p>
            )}

            {/* --- Stage 1 UI --- */}
            {currentStage === STAGES.STAGE1 && currentCard && (
              <div>
                {' '}
                {/* ... Stage 1 JSX ... */}
                <div
                  className={`relative w-full h-60 bg-white rounded-lg border border-gray-200 shadow-lg transition-transform duration-700 ease-in-out cursor-pointer mb-4 ${
                    isFlipped ? 'transform [transform:rotateY(180deg)]' : ''
                  } [transform-style:preserve-3d]`}
                  onClick={handleFlipCard}
                  role='button'
                  aria-live='polite'
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') handleFlipCard();
                  }}
                  aria-label={`카드 앞면: ${currentCard.native}. 클릭하여 뒷면 보기`}
                >
                  <div className='absolute w-full h-full flex items-center justify-center p-6 text-center [backface-visibility:hidden]'>
                    <p className='text-2xl font-semibold'>
                      {currentCard.native}
                    </p>
                  </div>
                  <div className='absolute w-full h-full flex items-center justify-center p-6 text-center bg-blue-500 text-white rounded-lg [backface-visibility:hidden] [transform:rotateY(180deg)]'>
                    <p className='text-2xl font-semibold'>
                      {currentCard.target}
                    </p>
                  </div>
                </div>
                <div className='flex flex-wrap justify-center items-center space-x-2 sm:space-x-4 mb-4'>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      currentCard.status === CARD_STATUS.LEARNED
                        ? 'bg-green-100 text-green-800'
                        : currentCard.status === CARD_STATUS.LEARNING
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {currentCard.status === CARD_STATUS.LEARNED
                      ? '학습 완료'
                      : currentCard.status === CARD_STATUS.LEARNING
                      ? '학습 중'
                      : '미학습'}
                  </span>
                  {isTTSLoading && isFlipped && (
                    <span className='text-xs text-purple-600 animate-pulse'>
                      음성 로딩 중...
                    </span>
                  )}
                  {isFlipped && !isTTSLoading && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCardStatus(currentCard.id, CARD_STATUS.LEARNED);
                        }}
                        className='bg-green-200 hover:bg-green-300 text-green-800 text-sm font-bold py-1 px-3 rounded-md transition duration-150 whitespace-nowrap'
                        title='이 카드 학습 완료로 표시'
                      >
                        알아요!
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCardStatus(
                            currentCard.id,
                            CARD_STATUS.LEARNING
                          );
                        }}
                        className='bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-sm font-bold py-1 px-3 rounded-md transition duration-150 whitespace-nowrap'
                        title='이 카드 다시 학습하기'
                      >
                        다시 볼래요
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(currentCard.target);
                        }}
                        className='bg-purple-200 hover:bg-purple-300 text-purple-800 text-sm font-bold py-1 px-3 rounded-md transition duration-150 whitespace-nowrap'
                        title='다시 듣기'
                      >
                        듣기
                      </button>
                    </>
                  )}
                </div>
                <div className='flex justify-between items-center mt-6 pt-4 border-t'>
                  <button
                    onClick={() => navigateCard(-1)}
                    disabled={currentIndex === 0}
                    className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow'
                    aria-label='이전 카드'
                  >
                    이전
                  </button>
                  <span className='text-gray-600 font-medium'>
                    {currentIndex + 1} / {cards.length}
                  </span>
                  <button
                    onClick={() => navigateCard(1)}
                    disabled={currentIndex === cards.length - 1}
                    className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow'
                    aria-label='다음 카드'
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {/* --- Stage 2 UI --- */}
            {currentStage === STAGES.STAGE2 && currentCard && (
              <div className='text-center'>
                {' '}
                {/* ... Stage 2 JSX ... */}
                <p className='text-lg text-gray-600 mb-2'>
                  아래 문장을 영어로 말해보세요:
                </p>
                <p className='text-2xl font-semibold text-gray-800 mb-6 h-16 flex items-center justify-center px-2'>
                  {currentCard.native}
                </p>
                <button
                  onClick={
                    isListening ? handleStopListening : handleStartListening
                  }
                  disabled={!recognitionRef.current}
                  className={`w-full px-6 py-3 rounded-lg text-white font-bold transition duration-200 ease-in-out shadow-md flex items-center justify-center gap-2 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-green-500 hover:bg-green-600'
                  } ${
                    !recognitionRef.current
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  aria-live='assertive'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {isListening ? '듣는 중... (클릭하여 중지)' : '말하기 시작'}
                </button>
                <div className='mt-4 min-h-[6rem] p-3 border border-gray-200 rounded-md bg-gray-50 text-sm sm:text-base'>
                  {sttError && (
                    <p className='text-red-500 font-semibold'>
                      오류: {sttError}
                    </p>
                  )}
                  {isListening && !sttError && (
                    <p className='text-gray-500 animate-pulse'>
                      듣고 있습니다...
                    </p>
                  )}
                  {sttTranscript && !isListening && (
                    <div className='space-y-1'>
                      <p className='text-gray-700 font-medium'>인식된 내용:</p>
                      <p className='font-semibold text-blue-600'>
                        {sttTranscript}
                      </p>
                    </div>
                  )}
                  {sttFeedback && !isListening && (
                    <p
                      className={`mt-2 font-bold ${
                        sttFeedback.startsWith('정답')
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {sttFeedback}
                    </p>
                  )}
                  {!isListening && !sttTranscript && !sttError && (
                    <p className='text-gray-400'>버튼을 누르고 말하세요.</p>
                  )}
                </div>
                <div className='flex justify-between items-center mt-6 pt-4 border-t'>
                  <button
                    onClick={() => navigateCard(-1)}
                    disabled={currentIndex === 0}
                    className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow'
                    aria-label='이전 카드'
                  >
                    이전
                  </button>
                  <span className='text-gray-600 font-medium'>
                    {currentIndex + 1} / {cards.length}
                  </span>
                  <button
                    onClick={() => navigateCard(1)}
                    disabled={currentIndex === cards.length - 1}
                    className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow'
                    aria-label='다음 카드'
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {/* --- Stage 3 UI --- */}
            {currentStage === STAGES.STAGE3 && (
              <div className='flex flex-col h-[60vh] max-h-[70vh]'>
                {' '}
                {/* ... Stage 3 JSX ... */}
                <div
                  ref={chatContainerRef}
                  className='flex-grow overflow-y-auto mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3'
                >
                  {conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === SENDER.USER
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {' '}
                      <div
                        className={`max-w-[75%] p-2 rounded-lg shadow-sm break-words ${
                          msg.sender === SENDER.USER
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.text}
                      </div>{' '}
                    </div>
                  ))}
                  {isAiResponding && (
                    <div className='flex justify-start'>
                      {' '}
                      <div className='max-w-[75%] p-2 rounded-lg bg-gray-200 text-gray-500 animate-pulse'>
                        답변 생각 중...
                      </div>{' '}
                    </div>
                  )}
                </div>
                {sttError && (
                  <p className='text-red-500 text-sm mb-2 text-center'>
                    {sttError}
                  </p>
                )}
                <form
                  onSubmit={handleSendTextMessage}
                  className='flex items-center gap-2'
                >
                  <input
                    type='text'
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={
                      isAiResponding
                        ? 'AI가 응답 중입니다...'
                        : '메시지를 입력하거나 마이크를 누르세요...'
                    }
                    className='flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    disabled={isAiResponding || isListening}
                    aria-label='대화 메시지 입력'
                  />
                  <button
                    type='submit'
                    disabled={
                      isAiResponding || isListening || !userInput.trim()
                    }
                    className='bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow'
                    aria-label='텍스트 메시지 전송'
                  >
                    전송
                  </button>
                  <button
                    type='button'
                    onClick={
                      isListening ? handleStopListening : handleStartListening
                    }
                    disabled={!recognitionRef.current || isAiResponding}
                    className={`p-2 rounded-md text-white font-bold transition duration-200 ease-in-out shadow ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-green-500 hover:bg-green-600'
                    } ${
                      !recognitionRef.current || isAiResponding
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    aria-label={
                      isListening ? '음성 입력 중지' : '음성 입력 시작'
                    }
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </form>
              </div>
            )}

            {/* Placeholder if no cards loaded */}
            {!cards.length && !error && (
              <div className='w-full mt-6 text-center text-gray-500 bg-white p-6 rounded-lg shadow-md'>
                <p>학습할 내용이 없습니다.</p>
                <p className='mt-1'>
                  먼저 학습할 내용을 입력하고 &apos;학습 시작&apos; 버튼을
                  클릭하세요.
                </p>
                <button
                  onClick={() => setCurrentStage(STAGES.LOAD)}
                  className='mt-3 text-blue-600 hover:underline font-semibold'
                >
                  입력 화면으로 돌아가기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
