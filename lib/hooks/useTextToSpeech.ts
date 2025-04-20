import { useState, useEffect, useCallback } from 'react';

// SpeechSynthesis 인터페이스 (Web Speech API)
interface SpeechSynthesisVoice {
  default: boolean;
  lang: string;
  localService: boolean;
  name: string;
  voiceURI: string;
}

// TTS 옵션 인터페이스
interface TextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// 훅 반환 값 인터페이스
interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  hasTtsSupport: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  error: string | null;
}

/**
 * 텍스트를 음성으로 변환하는 커스텀 훅
 * @param options TTS 옵션 (언어, 속도, 음조, 볼륨)
 * @returns TTS 상태 및 제어 함수
 */
export function useTextToSpeech({
  lang = 'en-US',
  rate = 1,
  pitch = 1,
  volume = 1,
}: TextToSpeechOptions = {}): UseTextToSpeechReturn {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRate, setCurrentRate] = useState<number>(rate);
  const [currentPitch, setCurrentPitch] = useState<number>(pitch);
  const [currentVolume, setCurrentVolume] = useState<number>(volume);

  // 브라우저 지원 여부 확인
  const hasTtsSupport =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // 음성 목록 불러오기
  useEffect(() => {
    if (!hasTtsSupport) return;

    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // 기본 음성 선택 (지정된 언어에 맞는 음성 중 첫 번째)
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice =
          availableVoices.find((voice) => voice.lang.includes(lang)) ||
          availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    // 음성 목록 초기화
    handleVoicesChanged();

    // 음성 목록 변경 이벤트 리스너
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [hasTtsSupport, lang, selectedVoice]);

  // 음성 재생
  const speak = useCallback(
    (text: string) => {
      if (!hasTtsSupport) {
        setError('브라우저가 TTS 기능을 지원하지 않습니다.');
        return;
      }

      try {
        // 이전 음성 재생 중이면 중지
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // 음성 설정
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.lang = lang;
        utterance.rate = currentRate;
        utterance.pitch = currentPitch;
        utterance.volume = currentVolume;

        // 상태 이벤트 처리
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };

        utterance.onerror = (event) => {
          setError(`TTS 오류: ${event.error}`);
          setIsSpeaking(false);
        };

        // 음성 재생
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        setError('TTS 재생 중 오류가 발생했습니다.');
        setIsSpeaking(false);
      }
    },
    [
      hasTtsSupport,
      selectedVoice,
      lang,
      currentRate,
      currentPitch,
      currentVolume,
    ]
  );

  // 음성 중지
  const stop = useCallback(() => {
    if (!hasTtsSupport) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [hasTtsSupport]);

  // 음성 일시 정지
  const pause = useCallback(() => {
    if (!hasTtsSupport || !isSpeaking) return;

    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [hasTtsSupport, isSpeaking]);

  // 음성 재개
  const resume = useCallback(() => {
    if (!hasTtsSupport || !isPaused) return;

    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [hasTtsSupport, isPaused]);

  // 음성 선택
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  // 속도 설정
  const setRate = useCallback((newRate: number) => {
    setCurrentRate(newRate);
  }, []);

  // 음조 설정
  const setPitch = useCallback((newPitch: number) => {
    setCurrentPitch(newPitch);
  }, []);

  // 볼륨 설정
  const setVolume = useCallback((newVolume: number) => {
    setCurrentVolume(newVolume);
  }, []);

  // 컴포넌트 해제 시 음성 중지
  useEffect(() => {
    return () => {
      if (hasTtsSupport && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [hasTtsSupport, isSpeaking]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    hasTtsSupport,
    voices,
    setVoice,
    selectedVoice,
    setRate,
    setPitch,
    setVolume,
    error,
  };
}
