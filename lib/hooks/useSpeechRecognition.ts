import { useState, useEffect, useCallback } from 'react';
import {
  SpeechRecognition,
  SpeechRecognitionEvent,
} from '../../types/speech-recognition';

// 음성 인식 옵션 인터페이스
interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

// 음성 인식 훅 반환 값 인터페이스
interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  hasRecognitionSupport: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

// SpeechRecognition 확장 타입 (maxAlternatives 속성 포함)
interface ExtendedSpeechRecognition extends SpeechRecognition {
  maxAlternatives?: number;
}

/**
 * 음성 인식 기능을 위한 커스텀 훅
 * @param options 음성 인식 옵션
 * @returns 음성 인식 상태 및 제어 함수
 */
export function useSpeechRecognition({
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1,
}: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] =
    useState<ExtendedSpeechRecognition | null>(null);

  // 브라우저 지원 여부 확인
  const hasRecognitionSupport =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // 초기화
  useEffect(() => {
    if (!hasRecognitionSupport) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition() as ExtendedSpeechRecognition;

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    if ('maxAlternatives' in recognition) {
      recognition.maxAlternatives = maxAlternatives;
    }

    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          // 중간 결과도 보여주기
          setTranscript((prev) => prev + transcript);
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as { error?: string };
      setError(`Speech recognition error: ${errorEvent.error || 'unknown'}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setRecognitionInstance(recognition);

    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, [
    continuous,
    interimResults,
    language,
    maxAlternatives,
    hasRecognitionSupport,
    isListening,
  ]);

  // 듣기 시작
  const startListening = useCallback(() => {
    if (!recognitionInstance) return;

    setError(null);
    setIsListening(true);

    try {
      recognitionInstance.start();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setError(`Error starting speech recognition: ${errorMessage}`);
      setIsListening(false);
    }
  }, [recognitionInstance]);

  // 듣기 중지
  const stopListening = useCallback(() => {
    if (!recognitionInstance) return;

    recognitionInstance.stop();
    setIsListening(false);
  }, [recognitionInstance]);

  // 기록 초기화
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
