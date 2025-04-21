import { GoogleGenerativeAI } from '@google/generative-ai';

// 응답 인터페이스 정의
export interface GeminiResponse {
  context?: string;
  nativeExpressions?: string[];
  sampleConversation?: string;
  error?: string;
}

// 요청 옵션 인터페이스
export interface GeminiRequestOptions {
  sentence: string;
  nativeSentence?: string;
}

/**
 * Gemini API를 사용하여 문장 맥락, 네이티브 표현, 샘플 대화를 생성
 * @param options 요청 옵션
 * @returns 생성된 내용 또는 오류
 */
export async function generatePodcastContent({
  sentence,
  nativeSentence,
}: GeminiRequestOptions): Promise<GeminiResponse> {
  if (!sentence) {
    return { error: '문장이 필요합니다.' };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // Google Generative AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // Gemini Pro 모델 사용
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
    });

    // 프롬프트 생성 - 언어는 항상 영어로 고정
    const nativeInfo = nativeSentence
      ? `\nEnglish sentence: ${sentence}\nMeaning in Korean: ${nativeSentence}`
      : `\nEnglish sentence: ${sentence}`;

    const prompt = `Create detailed information for the following English sentence in JSON format:${nativeInfo}

Please provide information divided into three parts:
1. context: Brief explanation of the situation where this sentence can be used (in English)
2. nativeExpressions: 3-5 alternative expressions that native English speakers would use more naturally
3. sampleConversation: A short conversation example between 2-3 people that includes this expression (in English)

Provide your response in the following JSON format:
{
  "context": "Explanation of when this sentence is used",
  "nativeExpressions": ["Expression 1", "Expression 2", "Expression 3"],
  "sampleConversation": "A: Conversation\\nB: Conversation\\nA: Conversation"
}

Return only the JSON format without any additional explanations or text.`;

    // API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.slice(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);

      return {
        context: parsed.context,
        nativeExpressions: parsed.nativeExpressions,
        sampleConversation: parsed.sampleConversation,
      };
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return {
        error: 'API 응답을 파싱하는 중 오류가 발생했습니다.',
        context: text, // 파싱 실패 시 원본 텍스트 반환
      };
    }
  } catch (error) {
    console.error('Gemini 서비스 오류:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Gemini 서비스 사용 중 알 수 없는 오류가 발생했습니다.',
    };
  }
}
