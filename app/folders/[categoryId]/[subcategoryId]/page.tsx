import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Flashcard } from '@/types/card';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

// 클라이언트 컴포넌트를 동적으로 임포트
const FlashcardList = dynamic(() => import('@/components/folders/FlashcardList'));

interface FlashcardPageProps {
  params: {
    categoryId: string;
    subcategoryId: string;
  };
}

// 메타데이터 생성 함수
export async function generateMetadata({ params }: FlashcardPageProps) {
  const { categoryId, subcategoryId } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single();
  
  const { data: subcategory } = await supabase
    .from('subcategories')
    .select('name')
    .eq('id', subcategoryId)
    .single();
  
  const categoryName = category?.name || '폴더';
  const subcategoryName = subcategory?.name || '하위 폴더';
  
  return {
    title: `${subcategoryName} - 플래시카드`,
    description: `${categoryName} > ${subcategoryName} 안의 플래시카드를 관리하세요`,
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

async function getSubcategoryServer(subcategoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', subcategoryId)
      .single();
    
    if (error) {
      console.error('Error fetching subcategory:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSubcategoryServer:', error);
    return null;
  }
}

async function getFlashcardsServer(subcategoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching flashcards:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFlashcardsServer:', error);
    return [];
  }
}

// 서버 액션 추가 - 플래시카드 목록을 새로고침
export async function refreshFlashcards(subcategoryId: string) {
  'use server';
  const flashcards = await getFlashcardsServer(subcategoryId);
  revalidatePath(`/folders/[categoryId]/${subcategoryId}`);
  return flashcards;
}

export default async function FlashcardPage({ params }: FlashcardPageProps) {
  const { categoryId, subcategoryId } = params;
  const category = await getCategoryServer(categoryId);
  const subcategory = await getSubcategoryServer(subcategoryId);
  const flashcards = await getFlashcardsServer(subcategoryId);
  
  if (!category || !subcategory) {
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
        <div className="flex items-center mb-2">
          <Link href="/folders" className="text-gray-500 hover:text-primary">
            폴더 목록
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href={`/folders/${categoryId}`} className="text-gray-500 hover:text-primary">
            {category.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700 font-medium">{subcategory.name}</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {subcategory.name} <span className="text-gray-500 font-normal">안의 플래시카드</span>
      </h1>
      
      {subcategory.description && (
        <p className="text-gray-600 mb-6">{subcategory.description}</p>
      )}
      
      <div className="mb-8">
        <FlashcardList
          flashcards={flashcards as Flashcard[]}
          subcategoryId={subcategoryId}
          refreshAction={refreshFlashcards}
        />
      </div>
      
      <div className="mt-8">
        <Link
          href={`/learn/stage1?subcategoryId=${subcategoryId}`}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
        >
          영작 연습하기
        </Link>
      </div>
    </div>
  );
}