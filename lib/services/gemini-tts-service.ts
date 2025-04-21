import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiTTSOptions {
  text: string;
  voice?: string;
  speed?: number;
}

export interface GeminiTTSResponse {
  audioUrl: string;
  geminiResponse?: string;
  error?: string;
}

/**
 * Gemini-2.0-flash-lite 모델을 사용하여 텍스트를 음성으로 변환
 * TTS 모델은 아니지만, 응답을 오디오로 생성하는 방식으로 사용
 */
export async function generateGeminiAudio({
  text,
  voice = 'natural',
  speed = 1.0,
}: GeminiTTSOptions): Promise<GeminiTTSResponse> {
  if (!text || text.trim() === '') {
    return { audioUrl: '', error: '텍스트가 필요합니다.' };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // Google Generative AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // Gemini-2.0-flash-lite 모델 사용
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
    });

    // Gemini에게 음성 나레이션 스크립트 생성 요청
    const prompt = `Please read the following text with a natural, engaging voice. 
Read it as if you are a professional podcaster or audiobook narrator.
Speak clearly, with proper pacing and intonation:

${text}

Adjust reading pace: ${
      speed === 1.0 ? 'normal' : speed < 1.0 ? 'slower' : 'faster'
    }
Voice style: ${voice || 'natural'}`;

    // API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // 실제로는 음성 파일을 생성할 수 없지만,
    // 텍스트를 웹 브라우저 TTS로 읽게 할 수 있음
    return {
      audioUrl: '', // 실제 오디오 URL을 생성할 수 없으므로 빈 값 반환
      geminiResponse: generatedText, // Gemini의 응답 반환
    };
  } catch (error) {
    console.error('Gemini TTS 서비스 오류:', error);
    return {
      audioUrl: '',
      error:
        error instanceof Error
          ? error.message
          : 'Gemini TTS 서비스 사용 중 알 수 없는 오류가 발생했습니다.',
    };
  }
}
