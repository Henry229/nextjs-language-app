import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

// OAuth 및 이메일 로그인 후 리디렉션을 처리하는 라우트
export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Next.js 15에서는 cookies 함수를 사용하기 전에 await 해야 함
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 인증 성공 후 리디렉션할 페이지
  return NextResponse.redirect(new URL('/', requestUrl.origin));
};
