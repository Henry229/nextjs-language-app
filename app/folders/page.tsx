import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Category, Subcategory } from '@/types/card';
import { Database } from '@/types/supabase';

// 클라이언트 컴포넌트를 동적으로 임포트
const FolderList = dynamic(() => import('@/components/folders/FolderList'));

export const metadata = {
  title: '폴더 관리 - 언어 학습',
  description: '학습 폴더를 관리하세요',
};

// 서버 액션 정의
async function refreshCategories(): Promise<(Category | Subcategory)[]> {
  'use server';
  // 서버에서 최신 데이터 가져오기
  const data = await getCategoriesServer();
  return data as (Category | Subcategory)[];
}

// 클라이언트와 서버에서 각각 사용할 데이터 가져오기 함수
async function getCategoriesServer() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategoriesServer:', error);
    return [];
  }
}

export default async function FoldersPage() {
  const categories = await getCategoriesServer();

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>폴더 관리</h1>

      <div className='mb-8'>
        <FolderList
          folders={categories as Category[]}
          type='category'
          refreshAction={refreshCategories}
        />
      </div>
    </div>
  );
}
