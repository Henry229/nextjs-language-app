/**
 * 음성인식(Speech Recognition) API 서비스
 */

import {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionConstructor,
} from '../../types/speech-recognition';

// 음성인식 결과 인터페이스
export interface SpeechRecognitionResult {
  transcript: string;
  confidence?: number;
  isFinal: boolean;
}

// 음성인식 이벤트 리스너 타입
export type SpeechRecognitionEventListener = (
  result: SpeechRecognitionResult
) => void;

// 사용 가능한 브라우저 음성인식 API 가져오기
const BrowserSpeechRecognition: SpeechRecognitionConstructor | undefined =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

/**
 * 브라우저의 음성인식 기능을 사용할 수 있는지 확인
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!BrowserSpeechRecognition;
}

/**
 * 클라이언트측 음성인식 서비스 클래스
 */
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: SpeechRecognitionEventListener | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  /**
   * 서비스 초기화
   * @param options 음성인식 옵션
   */
  constructor(
    private options: {
      lang?: string;
      continuous?: boolean;
      interimResults?: boolean;
    } = {}
  ) {
    if (typeof window !== 'undefined' && BrowserSpeechRecognition) {
      this.initRecognition();
    }
  }

  /**
   * 음성인식 객체 초기화
   */
  private initRecognition(): void {
    if (!BrowserSpeechRecognition) {
      console.error('Speech recognition is not supported in this browser');
      return;
    }

    this.recognition = new BrowserSpeechRecognition();
    this.recognition.lang = this.options.lang || 'en-US';
    this.recognition.continuous = this.options.continuous ?? true;
    this.recognition.interimResults = this.options.interimResults ?? true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!this.onResultCallback) return;

      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      const confidence = lastResult[0].confidence;
      const isFinal = lastResult.isFinal;

      this.onResultCallback({
        transcript,
        confidence,
        isFinal,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error || 'Unknown speech recognition error');
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * 음성 인식 시작
   */
  start(): void {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        if (this.onErrorCallback) {
          this.onErrorCallback('Speech recognition is not supported');
        }
        return;
      }
    }

    if (this.isListening) {
      this.stop();
    }

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Failed to start speech recognition');
      }
      console.error('Speech recognition start error:', error);
    }
  }

  /**
   * 음성 인식 중지
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('Speech recognition stop error:', error);
      }
    }
  }

  /**
   * 음성 인식 취소
   */
  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
        this.isListening = false;
      } catch (error) {
        console.error('Speech recognition abort error:', error);
      }
    }
  }

  /**
   * 음성 인식 결과 이벤트 리스너 설정
   */
  onResult(callback: SpeechRecognitionEventListener): void {
    this.onResultCallback = callback;
  }

  /**
   * 오류 이벤트 리스너 설정
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * 종료 이벤트 리스너 설정
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * 현재 듣고 있는지 상태 반환
   */
  isRecognizing(): boolean {
    return this.isListening;
  }
}

/**
 * 서버 기반 음성인식 API 호출 (Google Speech-to-Text 등 외부 API 사용 시)
 * @param audioBlob 오디오 데이터
 * @param options 옵션
 * @returns 변환된 텍스트 결과
 */
export async function recognizeSpeech(
  audioBlob: Blob,
  options: { lang?: string } = {}
): Promise<{ transcript?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    if (options.lang) {
      formData.append('lang', options.lang);
    }

    const response = await fetch('/api/speech-recognition', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Speech recognition request failed');
    }

    const data = await response.json();
    return { transcript: data.transcript };
  } catch (error) {
    console.error('Speech recognition API error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error in speech recognition',
    };
  }
}
