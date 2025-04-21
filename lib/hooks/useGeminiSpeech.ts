import { useState, useCallback, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

interface UseGeminiSpeechOptions {
  speed?: number;
  voice?: string;
}

interface UseGeminiSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  error: string | null;
}

/**
 * Gemini-2.0-flash-lite 모델을 사용하여 TTS 기능을 제공하는 커스텀 훅
 * 실제로는 Gemini가 생성한 텍스트를 브라우저 TTS로 읽게 함
 */
export function useGeminiSpeech({
  speed = 1.0,
  voice = 'natural',
}: UseGeminiSpeechOptions = {}): UseGeminiSpeechReturn {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // 브라우저 TTS를 사용하여 실제 음성 출력
  const {
    speak: speakTTS,
    stop: stopTTS,
    isSpeaking: isTTSSpeaking,
    error: ttsError,
    setVoice,
    voices,
  } = useTextToSpeech({
    rate: speed,
    pitch: 1.1,
    volume: 1.0,
  });

  // 최적 음성 선택 (호러 무비 느낌 줄이기)
  useEffect(() => {
    if (voices.length > 0) {
      // 선호하는 음성 목록 (더 자연스러운 음성 우선)
      const preferredVoices = [
        'Google US English Female',
        'Google US English',
        'Microsoft Zira',
        'Samantha',
        'Karen',
      ];

      // 사용 가능한 음성 중에서 선호하는 음성 찾기
      let bestVoice = null;
      for (const preferred of preferredVoices) {
        const found = voices.find((v) => v.name.includes(preferred));
        if (found) {
          bestVoice = found;
          break;
        }
      }

      // 선호하는 음성이 없으면 'en-US' 지역의 여성 음성 찾기
      if (!bestVoice) {
        bestVoice = voices.find(
          (v) =>
            v.lang.includes('en-US') &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('microsoft') // Microsoft 기본 음성 제외
        );
      }

      // 적합한 음성이 있다면 설정
      if (bestVoice) {
        console.log('선택된 음성:', bestVoice.name);
        setVoice(bestVoice);
      }
    }
  }, [voices, setVoice]);

  // TTS 오류 처리
  useEffect(() => {
    if (ttsError) {
      setError(ttsError);
    }
  }, [ttsError]);

  // 전체 텍스트 SSML로 처리 (음성 품질 향상)
  const processTextWithSSML = (text: string): string => {
    // SSML 마크업 추가 - 더 자연스러운 음성을 위해
    const processedText = text
      // 숫자 뒤에 점이 있는 경우 서수로 처리 (예: "25." -> "25번째")
      .replace(/(\d+)\./g, '<say-as interpret-as="ordinal">$1</say-as>')
      // 특수 약어 처리
      .replace(/([A-Z]{2,})/g, '<say-as interpret-as="characters">$1</say-as>')
      // 자연스러운 쉼표 처리
      .replace(/,/g, '<break time="200ms"/>')
      // 마침표 처리
      .replace(/\./g, '<break time="400ms"/>');

    return processedText;
  };

  // Gemini API를 통해 텍스트 처리 후 음성 출력
  const speak = useCallback(
    async (text: string) => {
      if (!text || text.trim() === '') {
        setError('텍스트가 필요합니다.');
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);

        // Gemini API 호출
        const response = await fetch('/api/gemini-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice,
            speed,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gemini TTS 처리 실패');
        }

        const data = await response.json();

        // Gemini의 응답 텍스트가 있으면 TTS로 읽기
        if (data.geminiResponse) {
          // 전체 텍스트를 한 번에 처리 (끊김 방지)
          const processedText = processTextWithSSML(data.geminiResponse);
          await speakTTS(processedText);
        } else {
          // Gemini 응답이 없으면 원본 텍스트 읽기
          const processedText = processTextWithSSML(text);
          await speakTTS(processedText);
        }
      } catch (err) {
        console.error('Gemini 음성 재생 오류:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Gemini TTS 사용 중 오류가 발생했습니다.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [speakTTS, voice, speed]
  );

  // 음성 재생 중지
  const stop = useCallback(() => {
    stopTTS();
  }, [stopTTS]);

  return {
    speak,
    stop,
    isSpeaking: isProcessing || isTTSSpeaking,
    error,
  };
}
