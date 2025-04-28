'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${className}`}
    >
      로그아웃
    </button>
  );
}
