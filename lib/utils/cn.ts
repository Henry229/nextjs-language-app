import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스를 조건부로 결합하고 충돌을 해결하는 유틸리티 함수
 * @param inputs 클래스 이름 배열
 * @returns 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
