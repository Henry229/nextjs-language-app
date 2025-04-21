import { useState, useCallback, useRef } from 'react';

interface UseUnrealSpeechOptions {
  apiKey?: string;
  voice?: string;
  bitrate?: string;
  speed?: number;
  pitch?: number;
}

interface UseUnrealSpeechReturn {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  error: string | null;
  stop: () => void;
}

/**
 * UnrealSpeech API를 사용하여 고품질 TTS를 제공하는 훅
 * @param options TTS 옵션 (apiKey, voice, bitrate, speed, pitch)
 * @returns TTS 상태 및 제어 함수
 */
export function useUnrealSpeech({
  apiKey,
  voice = 'Jasper',
  bitrate = '128k',
  speed = -0.2,
  pitch = 1.0,
}: UseUnrealSpeechOptions = {}): UseUnrealSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<{ text: string; resolve: () => void }[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  // API 키가 없을 경우 환경변수 사용
  const effectiveApiKey =
    apiKey || process.env.NEXT_PUBLIC_UNREALSPEECH_API_KEY;

  // 텍스트 전처리 (음성 품질 향상)
  const processText = (text: string): string => {
    return (
      text
        // 약어처리 (API, NASA 등 대문자 약어를 개별 문자로 발음)
        .replace(/([A-Z]{2,})/g, (match) => match.split('').join(' '))
        // 숫자 처리 (123th -> 123rd, 2nd 등 서수로 자연스럽게 읽기)
        .replace(/(\d+)(st|nd|rd|th)\b/g, '$1 $2')
        // 특수문자 공백 추가
        .replace(/([.,;:!?])/g, '$1 ')
        // 연속된 공백 제거
        .replace(/\s+/g, ' ')
        .trim()
    );
  };

  // 오디오 재생 중지 함수
  const stop = useCallback(() => {
    // 재생 큐 초기화
    audioQueueRef.current = [];
    isProcessingRef.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }

    // AudioContext가 있으면 일시 중지
    if (
      audioContextRef.current &&
      audioContextRef.current.state === 'running'
    ) {
      audioContextRef.current.suspend().catch(console.error);
    }
  }, []);

  // 음성 큐 처리 함수
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const { text, resolve } = audioQueueRef.current.shift()!;

    try {
      // UnrealSpeech API V8 호출
      const response = await fetch('https://api.v8.unrealspeech.com/stream', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Text: text,
          VoiceId: voice,
          Bitrate: bitrate,
          Speed: speed,
          Pitch: pitch,
          AudioFormat: 'mp3',
          SampleRate: 24000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }

      // 응답에서 오디오 데이터를 가져옴
      const arrayBuffer = await response.arrayBuffer();

      // AudioContext 재생 방식으로 변경 (자동 재생 정책을 더 잘 준수)
      if (typeof window !== 'undefined') {
        try {
          // 기존 AudioContext가 있으면 닫기
          if (audioContextRef.current) {
            await audioContextRef.current.close().catch(() => {});
          }

          // 새 AudioContext 생성
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;

          // 버퍼 디코딩
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // 소스 생성 및 연결
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);

          // 이벤트 핸들러 등록
          source.onended = () => {
            resolve(); // 현재 텍스트 재생 완료
            isProcessingRef.current = false;

            // 다음 항목 처리
            if (audioQueueRef.current.length > 0) {
              setTimeout(() => processQueue(), 100); // 약간의 간격을 두고 다음 항목 처리
            } else {
              setIsSpeaking(false);
            }
          };

          // 재생 시작
          setIsSpeaking(true);
          source.start(0);

          // 추가 이벤트 및 참조 정리
          audioContext.onstatechange = () => {
            if (audioContext.state === 'suspended') {
              isProcessingRef.current = false;
              setIsSpeaking(false);
            }
          };
        } catch (audioError) {
          console.error('오디오 처리 오류:', audioError);
          setError('오디오를 처리하는 중 오류가 발생했습니다.');
          isProcessingRef.current = false;
          setIsSpeaking(false);
          resolve(); // 오류가 있어도 이 항목 처리 완료로 표시

          // 다음 항목 처리 시도
          if (audioQueueRef.current.length > 0) {
            setTimeout(() => processQueue(), 100);
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`TTS 오류: ${errorMessage}`);
      isProcessingRef.current = false;
      setIsSpeaking(false);
      resolve(); // 오류가 있어도 이 항목 처리 완료로 표시

      // 다음 항목 처리 시도
      if (audioQueueRef.current.length > 0) {
        setTimeout(() => processQueue(), 100);
      }
    }
  }, [effectiveApiKey, voice, bitrate, speed, pitch]);

  const speak = useCallback(
    async (text: string) => {
      // 공백이거나 짧은 텍스트는 중지 명령으로 처리
      if (!text || text.trim().length <= 1) {
        stop();
        return;
      }

      if (!effectiveApiKey) {
        setError('UnrealSpeech API 키가 필요합니다.');
        return;
      }

      try {
        // 텍스트 전처리
        const processedText = processText(text);

        // 텍스트를 더 작은 단위로 분할하지 않고 전체 텍스트를 한 번에 처리
        // 이렇게 하면 UnrealSpeech API가 자연스러운 흐름으로 전체 텍스트를 합성할 수 있음
        return new Promise<void>((resolve) => {
          // 큐에 추가
          audioQueueRef.current.push({ text: processedText, resolve });

          // 큐 처리 시작 (이미 처리 중이 아닌 경우)
          if (!isProcessingRef.current) {
            processQueue();
          }
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.';
        setError(`TTS 오류: ${errorMessage}`);
        setIsSpeaking(false);
      }
    },
    [effectiveApiKey, processQueue, stop]
  );

  return {
    speak,
    isSpeaking,
    error,
    stop,
  };
}

// 타입 정의 추가
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}
