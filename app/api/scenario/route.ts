import { NextRequest, NextResponse } from 'next/server';
import { generateScenario } from '@/lib/services/openai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context } = body;

    // 필수 인자 검증
    if (!context) {
      return NextResponse.json(
        { error: '대화 컨텍스트(context)가 필요합니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 호출하여 시나리오 생성
    const scenarioResponse = await generateScenario(context);

    // 오류가 있는 경우
    if (scenarioResponse.error) {
      return NextResponse.json(
        { error: scenarioResponse.error },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json(scenarioResponse, { status: 200 });
  } catch (error) {
    console.error('Scenario API 오류:', error);
    return NextResponse.json(
      {
        error: '시나리오 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
