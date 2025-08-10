import OpenAI from 'openai';

// 응답 인터페이스 정의
export interface OpenAIConversationResponse {
  conversation?: string;
  followUpQuestions?: string[];
  emotionalTone?: string;
  error?: string;
}

// 요청 옵션 인터페이스
export interface OpenAIConversationOptions {
  userInput: string;
  learningContext: string;
  previousExchange?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
}

/**
 * OpenAI API를 사용하여 대화 생성 및 분석
 * @param options 요청 옵션
 * @returns 생성된 대화 또는 오류
 */
export async function generateConversation({
  userInput,
  learningContext,
  previousExchange = '',
  nativeLanguage = 'Korean',
  targetLanguage = 'English',
}: OpenAIConversationOptions): Promise<OpenAIConversationResponse> {
  if (!userInput || !learningContext) {
    return { error: '사용자 입력과 학습 컨텍스트가 필요합니다.' };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // OpenAI 초기화
    const openai = new OpenAI({
      apiKey,
    });

    // 시스템 프롬프트 구성
    const systemPrompt = `You are a helpful language tutor assisting a ${nativeLanguage} speaker learning ${targetLanguage}. 
    Generate a natural, conversational response to the user's input.
    
    Your goal is to:
    1. Continue the conversation naturally based on the context provided
    2. Use language that's appropriate for the learner's level
    3. Include emotional expression in your response (surprise, excitement, curiosity, etc.)
    4. Incorporate vocabulary and structures from the learning context when possible
    5. Gently correct any serious language errors without disrupting the flow
    
    Learning context (vocabulary/sentences the user has learned): ${learningContext}
    
    Previous exchanges (if any): ${previousExchange}
    
    Respond in this format:
    {
      "conversation": "Your natural conversation response in ${targetLanguage}",
      "followUpQuestions": ["1-3 natural follow-up questions to continue the conversation"],
      "emotionalTone": "The emotional tone of your response (e.g., excited, curious, sympathetic)"
    }`;

    // API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('API가 응답을 반환하지 않았습니다.');
    }

    // JSON 파싱
    try {
      const parsedResponse = JSON.parse(assistantMessage);
      return {
        conversation: parsedResponse.conversation,
        followUpQuestions: parsedResponse.followUpQuestions,
        emotionalTone: parsedResponse.emotionalTone,
      };
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return {
        error: 'API 응답을 파싱하는 중 오류가 발생했습니다.',
        conversation: assistantMessage, // 파싱 실패 시 원본 텍스트 반환
      };
    }
  } catch (error) {
    console.error('OpenAI 서비스 오류:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'OpenAI 서비스 사용 중 알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 입력을 분석하여 피드백 제공
 * @param userInput 사용자 입력
 * @param correctExpression 정확한 표현
 * @returns 분석 결과
 */
export async function analyzeUserLanguage(
  userInput: string,
  correctExpression: string
): Promise<{
  corrected: string;
  feedback: string;
  alternatives?: string[];
  error?: string;
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // OpenAI 초기화
    const openai = new OpenAI({
      apiKey,
    });

    // 프롬프트 구성
    const prompt = `Analyze this language learner's input compared to the correct expression:

User input: "${userInput}"
Correct expression: "${correctExpression}"

Provide feedback in this JSON format:
{
  "corrected": "A corrected version of the user's input",
  "feedback": "Brief, constructive, and encouraging feedback",
  "alternatives": ["1-3 alternative expressions that could also be correct"]
}`;

    // API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful language tutor.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('API가 응답을 반환하지 않았습니다.');
    }

    // JSON 파싱
    return JSON.parse(assistantMessage);
  } catch (error) {
    console.error('OpenAI 분석 오류:', error);
    return {
      corrected: '',
      feedback: '분석 중 오류가 발생했습니다.',
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * OpenAI를 사용하여 상황 시나리오 생성
 * @param context 대화 컨텍스트 (학습한 문장 및 테마)
 * @returns 생성된 시나리오
 */
export async function generateScenario(context: string): Promise<{
  scenario: string;
  initialPrompt: string;
  vocabularyList: string[];
  error?: string;
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // OpenAI 초기화
    const openai = new OpenAI({
      apiKey,
    });

    // 프롬프트 구성
    const prompt = `Generate a conversational scenario for language practice based on these learned phrases/context:
    
"${context}"

Create a realistic scenario that incorporates these phrases naturally.

Respond in this JSON format:
{
  "scenario": "Brief description of the conversation scenario (setting, participants, purpose)",
  "initialPrompt": "The opening line to start the conversation",
  "vocabularyList": ["5-8 key vocabulary words or phrases from the scenario"]
}`;

    // API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a language learning assistant who creates realistic conversation scenarios.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('API가 응답을 반환하지 않았습니다.');
    }

    // JSON 파싱
    return JSON.parse(assistantMessage);
  } catch (error) {
    console.error('OpenAI 시나리오 생성 오류:', error);
    return {
      scenario: '',
      initialPrompt: '',
      vocabularyList: [],
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
