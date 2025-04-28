'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex gap-2 items-center">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-4 items-center">
        <Link 
          href="/auth/login" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          로그인
        </Link>
        <Link 
          href="/auth/signup" 
          className="text-sm font-medium px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Profile" 
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
      </div>
      <LogoutButton />
    </div>
  );
}
