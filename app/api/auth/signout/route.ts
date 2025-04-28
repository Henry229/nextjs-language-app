import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

// 로그아웃 처리를 위한 API 라우트
export const POST = async (request: NextRequest) => {
  // Next.js 15에서는 cookies 함수를 사용하기 전에 await 해야 함
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  // 로그아웃 처리
  await supabase.auth.signOut();
  
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  });
};
