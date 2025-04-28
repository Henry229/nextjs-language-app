import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// 서버 컴포넌트에서 사용하는 Supabase 클라이언트
export async function createClient() {
  return createServerComponentClient<Database>({
    cookies
  });
}
