import { NextRequest, NextResponse } from 'next/server';
import { generatePodcastContent } from '@/lib/services/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentence, nativeSentence } = body;

    // 필수 인자 검증
    if (!sentence) {
      return NextResponse.json(
        { error: '문장(sentence)이 필요합니다.' },
        { status: 400 }
      );
    }

    // Gemini API 호출하여 콘텐츠 생성
    const podcastContent = await generatePodcastContent({
      sentence,
      nativeSentence,
    });

    // 오류가 있는 경우
    if (podcastContent.error) {
      return NextResponse.json(
        { error: podcastContent.error },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json(podcastContent, { status: 200 });
  } catch (error) {
    console.error('Podcast API 오류:', error);
    return NextResponse.json(
      {
        error: '팟캐스트 콘텐츠 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
