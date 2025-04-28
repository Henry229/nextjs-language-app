import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Category, Subcategory } from '@/types/card';
import Link from 'next/link';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

// 클라이언트 컴포넌트를 동적으로 임포트
const FolderList = dynamic(() => import('@/components/folders/FolderList'));

interface SubcategoryPageProps {
  params: {
    categoryId: string;
  };
}

// 메타데이터 생성 함수
export async function generateMetadata({ params }: SubcategoryPageProps) {
  const categoryId = params.categoryId;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single();
  
  const categoryName = data?.name || '폴더';
  
  return {
    title: `${categoryName} - 중분류 폴더`,
    description: `${categoryName} 안의 중분류 폴더를 관리하세요`,
  };
}

// 클라이언트와 서버에서 각각 사용할 데이터 가져오기 함수
async function getCategoryServer(categoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCategoryServer:', error);
    return null;
  }
}

async function getSubcategoriesServer(categoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSubcategoriesServer:', error);
    return [];
  }
}

// 서버 액션 추가 - 중분류 폴더(서브카테고리) 목록을 새로고침
export async function refreshSubcategories(categoryId: string) {
  'use server';
  const subcategories = await getSubcategoriesServer(categoryId);
  revalidatePath(`/folders/${categoryId}`);
  return subcategories;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const categoryId = params.categoryId;
  const category = await getCategoryServer(categoryId);
  const subcategories = await getSubcategoriesServer(categoryId);
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">폴더를 찾을 수 없습니다</h1>
        <p className="mb-4">요청하신 폴더를 찾을 수 없습니다.</p>
        <Link href="/folders" className="text-primary hover:underline">
          폴더 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/folders" className="text-primary hover:underline flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          폴더 목록으로 돌아가기
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {category.name} <span className="text-gray-500 font-normal">안의 중분류 폴더</span>
      </h1>
      
      {category.description && (
        <p className="text-gray-600 mb-6">{category.description}</p>
      )}
      
      <div className="mb-8">
        <FolderList
          folders={subcategories as Subcategory[]}
          type="subcategory"
          categoryId={categoryId}
          refreshAction={refreshSubcategories}
          emptyMessage="이 폴더에는 중분류 폴더가 없습니다. 새 폴더를 만들어보세요."
        />
      </div>
    </div>
  );
}