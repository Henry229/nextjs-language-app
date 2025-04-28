export const CARD_STATUS = {
  UNSEEN: 'unseen',
  LEARNING: 'learning',
  LEARNED: 'learned',
} as const;

export type CardStatusType = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];

/**
 * 로컬 스토리지용 기본 카드 인터페이스 (기존 코드와의 호환성을 위해 유지)
 */
export interface Card {
  id: number;
  native: string;
  target: string;
  status: CardStatusType;
}

/**
 * Supabase 데이터베이스의 카테고리(대분류 폴더) 인터페이스
 */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase 데이터베이스의 서브카테고리(중분류 폴더) 인터페이스
 */
export interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase 데이터베이스의 플래시카드 인터페이스
 */
export interface Flashcard {
  id: string;
  subcategory_id: string;
  native_text: string;
  foreign_text: string;
  pronunciation: string | null;
  notes: string | null;
  difficulty_level: number | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase 데이터베이스의 사용자 진행 상황 인터페이스
 */
export interface UserProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  stage: number;
  status: string;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 로컬 스토리지 데이터를 Supabase 형식으로 변환하기 위한 헬퍼 함수
 */
export const convertLocalCardToFlashcard = (
  card: Card,
  subcategoryId: string,
  userId: string
): Omit<Flashcard, 'id' | 'created_at' | 'updated_at'> => {
  return {
    subcategory_id: subcategoryId,
    native_text: card.native,
    foreign_text: card.target,
    pronunciation: null,
    notes: null,
    difficulty_level: null,
    user_id: userId
  };
};

/**
 * Supabase Flashcard를 로컬 Card 형식으로 변환하기 위한 헬퍼 함수
 */
export const convertFlashcardToLocalCard = (
  flashcard: Flashcard,
  status: CardStatusType = CARD_STATUS.UNSEEN
): Card => {
  return {
    id: parseInt(flashcard.id.split('-')[0], 16) % 1000000, // UUID에서 숫자 ID 생성
    native: flashcard.native_text,
    target: flashcard.foreign_text,
    status: status
  };
};
