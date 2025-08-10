import { NextRequest, NextResponse } from 'next/server';
import { generateConversation } from '@/lib/services/openai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, learningContext, previousExchange, nativeLanguage, targetLanguage } = body;

    // 필수 인자 검증
    if (!userInput) {
      return NextResponse.json(
        { error: '사용자 입력(userInput)이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!learningContext) {
      return NextResponse.json(
        { error: '학습 컨텍스트(learningContext)가 필요합니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 호출하여 대화 생성
    const conversationResponse = await generateConversation({
      userInput,
      learningContext,
      previousExchange,
      nativeLanguage,
      targetLanguage,
    });

    // 오류가 있는 경우
    if (conversationResponse.error) {
      return NextResponse.json(
        { error: conversationResponse.error },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json(conversationResponse, { status: 200 });
  } catch (error) {
    console.error('Conversation API 오류:', error);
    return NextResponse.json(
      {
        error: '대화 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
