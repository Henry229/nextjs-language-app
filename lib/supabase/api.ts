import { createClient } from './client';
import { Database } from '@/types/supabase';
import { Category, Subcategory, Flashcard } from '@/types/card';

// 카테고리(대분류 폴더) 관련 함수
export const getCategories = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data;
};

export const getCategoryById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    throw error;
  }

  return data;
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
};

export const deleteCategory = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }

  return true;
};

// 서브카테고리(중분류 폴더) 관련 함수
export const getSubcategories = async (categoryId?: string) => {
  const supabase = createClient();
  
  let query = supabase
    .from('subcategories')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }

  return data;
};

export const getSubcategoryById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching subcategory:', error);
    throw error;
  }

  return data;
};

export const createSubcategory = async (subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const { data, error } = await supabase
    .from('subcategories')
    .insert({
      ...subcategory,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }

  return data;
};

export const updateSubcategory = async (id: string, subcategory: Partial<Subcategory>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subcategories')
    .update(subcategory)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }

  return data;
};

export const deleteSubcategory = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }

  return true;
};

// 플래시카드 관련 함수
export const getFlashcards = async (subcategoryId?: string) => {
  const supabase = createClient();
  
  let query = supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching flashcards:', error);
    throw error;
  }

  return data;
};

export const getFlashcardById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching flashcard:', error);
    throw error;
  }

  return data;
};

export const createFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      ...flashcard,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }

  return data;
};

export const updateFlashcard = async (id: string, flashcard: Partial<Flashcard>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('flashcards')
    .update(flashcard)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating flashcard:', error);
    throw error;
  }

  return data;
};

export const deleteFlashcard = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }

  return true;
};

// CSV 데이터를 플래시카드로 일괄 생성하는 함수
export const createFlashcardsFromCSV = async (
  subcategoryId: string, 
  flashcards: Array<{ native_text: string; foreign_text: string; }>
) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 모든 카드에 subcategory_id와 user_id 추가
  const cardsWithIds = flashcards.map(card => ({
    ...card,
    subcategory_id: subcategoryId,
    user_id: user.id
  }));
  
  const { data, error } = await supabase
    .from('flashcards')
    .insert(cardsWithIds)
    .select();

  if (error) {
    console.error('Error bulk creating flashcards:', error);
    throw error;
  }

  return data;
};

// 사용자 학습 진행 상황 관련 함수
export const getUserProgress = async (flashcardId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 결과가 없는 경우
    console.error('Error fetching user progress:', error);
    throw error;
  }

  return data;
};

export const updateUserProgress = async (
  flashcardId: string, 
  progress: { stage: number; status: string; }
) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 기존 데이터 확인
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (existingProgress) {
    // 기존 데이터 업데이트
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        ...progress,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProgress.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
    
    return data;
  } else {
    // 새 데이터 생성
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        flashcard_id: flashcardId,
        ...progress,
        last_reviewed_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user progress:', error);
      throw error;
    }
    
    return data;
  }
};
