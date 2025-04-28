import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

// 보호되어야 하는 경로들
const protectedRoutes = [
  // 필요에 따라 보호가 필요한 경로 추가
  // '/learn/settings',
  // '/admin',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // next.js 15에서는 req, res를 전달하여 미들웨어 클라이언트 생성
  // 미들웨어에서는 cookies()를 사용하지 않으므로 변경 불필요
  const supabase = createMiddlewareClient<Database>({ req, res });

  // 세션 새로고침
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 현재 경로
  const path = req.nextUrl.pathname;

  // 보호된 경로에 접근할 때 인증 확인
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    // 로그인 페이지로 리디렉션하되, 원래 가려던 URL을 쿼리 파라미터로 포함
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근할 경우
  if ((path === '/auth/login' || path === '/auth/signup') && session) {
    // 대시보드나 홈으로 리디렉션
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // 이 경로들에 미들웨어가 적용됩니다
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)',
  ],
};
