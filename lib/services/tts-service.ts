/**
 * Text-to-Speech API 서비스
 */

// API 요청 옵션 인터페이스
interface TTSRequestOptions {
  text: string;
  lang?: string;
  voice?: string;
  speed?: number;
}

// TTS 응답 인터페이스
interface TTSResponse {
  audioUrl?: string;
  error?: string;
}

/**
 * 텍스트를 오디오로 변환하는 API 호출
 * @param options TTS 요청 옵션
 * @returns 오디오 URL 또는 오류
 */
export async function textToSpeech({
  text,
  lang = 'en-US',
  voice = 'en-US-Standard-A',
  speed = -0.2,
}: TTSRequestOptions): Promise<TTSResponse> {
  if (!text) {
    return { error: 'Text is required' };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_TTS_API_KEY;

    if (!apiKey) {
      throw new Error(
        'TTS API key is missing. Please check your environment variables.'
      );
    }

    // 외부 TTS API 호출
    // 실제 API 엔드포인트와 파라미터는 사용하는 서비스에 따라 변경 필요
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        lang,
        voice,
        speed,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'TTS API request failed');
    }

    const data = await response.json();
    return { audioUrl: data.audioUrl };
  } catch (error) {
    console.error('TTS service error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred with the TTS service',
    };
  }
}

/**
 * 브라우저의 기본 Web Speech API를 사용하여 텍스트를 음성으로 변환
 * (API 호출 없이 클라이언트 측에서 작동)
 * @param text 읽을 텍스트
 * @param options 음성 옵션
 * @returns 성공 여부
 */
export function speakText(
  text: string,
  options: { lang?: string; rate?: number; pitch?: number; voice?: string } = {}
): boolean {
  if (!window.speechSynthesis) {
    console.error('Browser does not support speech synthesis');
    return false;
  }

  try {
    // 기존 음성 중지
    window.speechSynthesis.cancel();

    // 새 음성 생성
    const utterance = new SpeechSynthesisUtterance(text);

    // 옵션 설정
    if (options.lang) utterance.lang = options.lang;
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;

    // 음성 선택
    if (options.voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === options.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    // 음성 재생
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return false;
  }
}

/**
 * 로컬 TTS 서비스를 사용할지 또는 API를 호출할지 결정하는 함수
 * @param text 음성으로 변환할 텍스트
 * @param options 옵션
 * @returns 성공 여부 또는 오디오 URL
 */
export async function speakWithFallback(
  text: string,
  options: {
    useApi?: boolean;
    lang?: string;
    rate?: number;
    pitch?: number;
    voice?: string;
  } = {}
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  // API 사용 옵션이 있거나 브라우저가 음성 합성을 지원하지 않는 경우 API 사용
  if (options.useApi || !window.speechSynthesis) {
    const response = await textToSpeech({
      text,
      lang: options.lang,
      voice: options.voice,
      speed: options.rate,
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, audioUrl: response.audioUrl };
  }

  // 브라우저의 기본 음성 합성 사용
  const success = speakText(text, options);
  return { success };
}
