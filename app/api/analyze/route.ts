import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserLanguage } from '@/lib/services/openai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, correctExpression } = body;

    // 필수 인자 검증
    if (!userInput) {
      return NextResponse.json(
        { error: '사용자 입력(userInput)이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!correctExpression) {
      return NextResponse.json(
        { error: '정확한 표현(correctExpression)이 필요합니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 호출하여 언어 분석
    const analysisResponse = await analyzeUserLanguage(
      userInput,
      correctExpression
    );

    // 오류가 있는 경우
    if (analysisResponse.error) {
      return NextResponse.json(
        { error: analysisResponse.error },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json(analysisResponse, { status: 200 });
  } catch (error) {
    console.error('Analysis API 오류:', error);
    return NextResponse.json(
      {
        error: '언어 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
