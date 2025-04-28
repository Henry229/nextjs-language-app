'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage('가입 확인 이메일을 확인해주세요.');
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Google 회원가입 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">회원가입</h1>
          <p className="mt-2 text-gray-600">
            언어 학습 웹 서비스 계정을 만들어보세요.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="6자 이상의 비밀번호"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="비밀번호 재입력"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.643 2.03-2.399 3.458-5.445 3.458-3.314 0-6-2.686-6-6s2.686-6 6-6c1.464 0 2.792 0.532 3.826 1.409l2.778-2.778c-1.773-1.649-4.115-2.65-6.604-2.65-5.514 0-10 4.486-10 10s4.486 10 10 10c5.772 0 9.6-4.057 9.6-9.773 0-0.727-0.094-1.436-0.238-2.109h-9.362z"
                  fill="#4285F4"
                />
                <path
                  d="M12.545 10.239v3.821h5.445c-0.243 0.767-0.636 1.451-1.146 2.019h0.001l3.419 2.646c-1.994 1.85-4.585 2.981-7.719 2.981-5.514 0-10-4.486-10-10s4.486-10 10-10c2.489 0 4.831 1.001 6.604 2.65l-2.778 2.778c-1.034-0.877-2.362-1.409-3.826-1.409-3.314 0-6 2.686-6 6s2.686 6 6 6c3.046 0 4.802-1.428 5.445-3.458h-5.445v-3.821h9.362c0.144 0.673 0.238 1.382 0.238 2.109 0 5.716-3.828 9.773-9.6 9.773z"
                  fill="#34A853"
                />
                <path
                  d="M6.545 14.518v-3.821h-5.435c0.143-0.672 0.237-1.381 0.237-2.108 0-5.715 3.828-9.772 9.599-9.772v3.821c-3.046 0-4.801 1.428-5.444 3.458h5.444v3.821h-5.444c0.643-2.03 2.398-3.458 5.444-3.458v3.821c-3.045 0-4.801-1.428-5.444-3.458h-3.55v3.821h9.599c0.144 0.672 0.238 1.381 0.238 2.108 0 5.715-3.828 9.772-9.599 9.772v-3.821c3.045 0 4.801-1.428 5.444-3.458h-5.444z"
                  fill="#FBBC05"
                />
                <path
                  d="M17.1 11.181c0.826 2.593 0.487 4.736-0.911 6.368l-3.419-2.646c0.51-0.568 0.903-1.252 1.146-2.019h-5.445v-3.822h8.629z"
                  fill="#EA4335"
                />
              </svg>
              Google로 회원가입
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
