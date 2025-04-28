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
  autoStop?: boolean; // 사용자가 말을 멈추면 자동으로 인식 중지
  silenceTimeout?: number; // 침묵 감지 시간 (ms)
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
  isSpeaking: boolean; // 사용자가 현재 말하고 있는지 여부
  confidence: number; // 마지막 인식 결과의 신뢰도 (0-1)
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
  maxAlternatives = 3,
  autoStop = true,
  silenceTimeout = 1500,
}: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [recognitionInstance, setRecognitionInstance] =
    useState<ExtendedSpeechRecognition | null>(null);

  // 자동 중지를 위한 타이머 참조
  const silenceTimerRef = useState<NodeJS.Timeout | null>(null);

  // 브라우저 지원 여부 확인
  const hasRecognitionSupport =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // 침묵 감지 로직
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef[0]) {
      clearTimeout(silenceTimerRef[0]);
      silenceTimerRef[0] = null;
    }

    if (autoStop && isListening) {
      silenceTimerRef[0] = setTimeout(() => {
        if (recognitionInstance && isListening) {
          recognitionInstance.stop();
        }
      }, silenceTimeout);
    }
  }, [
    autoStop,
    isListening,
    recognitionInstance,
    silenceTimeout,
    silenceTimerRef,
  ]);

  // 초기화 - 인식 인스턴스 생성 및 이벤트 핸들러 설정
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

    // 음성 인식 결과 처리
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      // 말하고 있음 상태 설정
      setIsSpeaking(true);

      // 자동 중지 타이머 재설정
      resetSilenceTimer();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        // 가장 높은 신뢰도 추적
        if (result[0].confidence > bestConfidence) {
          bestConfidence = result[0].confidence;
          setConfidence(bestConfidence);
        }

        // 더 정확한 결과를 위해 여러 대안 중에서 최상의 결과 선택
        let bestAlternative = result[0];
        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > bestAlternative.confidence) {
            bestAlternative = result[j];
          }
        }

        const transcript = bestAlternative.transcript;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      } else if (interimTranscript) {
        // 임시 결과가 있는 경우만 업데이트 (깜빡임 방지)
        setTranscript((prev) => {
          // 이전 결과와 실질적으로 다른 경우에만 업데이트
          if (
            interimTranscript.trim() &&
            (prev.trim() === '' || interimTranscript.length > prev.length * 0.5)
          ) {
            return interimTranscript;
          }
          return prev;
        });
      }
    };

    // 오디오 감지 이벤트 - 말하기 시작
    recognition.onaudiostart = () => {
      setIsSpeaking(true);
      resetSilenceTimer();
    };

    // 오디오 종료 이벤트 - 말하기 중지
    recognition.onaudioend = () => {
      setIsSpeaking(false);
    };

    // 음성 인식 오류 처리
    recognition.onerror = (event: Event) => {
      const errorEvent = event as { error?: string };

      // 'no-speech' 오류는 정보 제공용으로만 처리 (오류로 표시하지 않음)
      if (errorEvent.error === 'no-speech') {
        setIsSpeaking(false);
        return;
      }

      setError(`Speech recognition error: ${errorEvent.error || 'unknown'}`);
      setIsListening(false);
      setIsSpeaking(false);
    };

    // 음성 인식 종료 처리
    recognition.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);

      // 타이머 정리
      if (silenceTimerRef[0]) {
        clearTimeout(silenceTimerRef[0]);
        silenceTimerRef[0] = null;
      }
    };

    setRecognitionInstance(recognition);

    // isListening 참조를 사용하지 않는 방식으로 클린업 함수 변경
    return () => {
      if (recognition) {
        // 이벤트 핸들러 제거
        recognition.onresult = null;
        recognition.onaudiostart = null;
        recognition.onaudioend = null;
        recognition.onerror = null;
        recognition.onend = null;
        
        // 클린업 함수에서 stop() 호출을 제거
        // 무한 루프 방지를 위해 현재 isListening을 참조하지 않음
      }

      if (silenceTimerRef[0]) {
        clearTimeout(silenceTimerRef[0]);
        silenceTimerRef[0] = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    continuous, 
    interimResults,
    language,
    maxAlternatives,
    hasRecognitionSupport,
    resetSilenceTimer,
    silenceTimerRef,
  ]);
  
  // 별도의 useEffect로 분리하여 isListening 상태가 변경될 때만 처리
  useEffect(() => {
    // 인식 인스턴스가 없으면 아무것도 하지 않음
    if (!recognitionInstance) return;
    
    // isListening이 true지만 인식이 시작되지 않았을 경우 시작
    if (isListening) {
      try {
        // 이미 시작된 상태에서 다시 start()를 호출하면 에러가 발생할 수 있으므로 조심해야 함
        // 여기에서는 별도의 상태로 추적하지 않고 try-catch로 처리
        recognitionInstance.start();
      } catch (error) {
        // 이미 실행 중인 경우의 에러는 무시 (DOMException: SpeechRecognition has already been started.)
        console.log('Recognition already started or other error');
      }
    } else {
      // isListening이 false일 때 인식 중지
      try {
        recognitionInstance.stop();
      } catch (error) {
        // 이미 중지된 경우의 에러는 무시
        console.log('Recognition not running or other error');
      }
    }
    
  }, [isListening, recognitionInstance]);

  // 듣기 시작
  const startListening = useCallback(() => {
    if (!recognitionInstance) return;

    setError(null);
    setIsListening(true);
    setIsSpeaking(false);
    setConfidence(0);

    try {
      recognitionInstance.start();
      resetSilenceTimer();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setError(`Error starting speech recognition: ${errorMessage}`);
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [recognitionInstance, resetSilenceTimer]);

  // 듣기 중지
  const stopListening = useCallback(() => {
    if (!recognitionInstance) return;

    if (silenceTimerRef[0]) {
      clearTimeout(silenceTimerRef[0]);
      silenceTimerRef[0] = null;
    }

    recognitionInstance.stop();
    setIsListening(false);
    setIsSpeaking(false);
  }, [recognitionInstance, silenceTimerRef]);

  // 기록 초기화
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  return {
    transcript,
    isListening,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSpeaking,
    confidence,
  };
}
