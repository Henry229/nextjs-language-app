import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiAudio } from '@/lib/services/gemini-tts-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, speed } = body;

    // 필수 인자 검증
    if (!text) {
      return NextResponse.json(
        { error: '텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // Gemini API 호출하여 음성 생성
    const result = await generateGeminiAudio({
      text,
      voice,
      speed,
    });

    // 오류가 있는 경우
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 성공 응답
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Gemini TTS API 오류:', error);
    return NextResponse.json(
      {
        error: 'Gemini TTS 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
