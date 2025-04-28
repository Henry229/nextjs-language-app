import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
export const createClient = () => 
  createClientComponentClient<Database>();
