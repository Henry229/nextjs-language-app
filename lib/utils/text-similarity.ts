/**
 * 텍스트 유사도를 계산하는 유틸리티 함수들을 제공합니다.
 */

/**
 * 두 문자열 간의 Levenshtein 거리(편집 거리)를 계산합니다.
 * @param a 첫번째 문자열
 * @param b 두번째 문자열
 * @returns 두 문자열 간의 편집 거리
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // 행렬 초기화
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // 편집 거리 계산
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 대체
          Math.min(
            matrix[i][j - 1] + 1, // 삽입
            matrix[i - 1][j] + 1 // 삭제
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 두 문자열의 유사도를 0과 1 사이의 값으로 계산합니다.
 * 1에 가까울수록 더 유사함을 의미합니다.
 *
 * @param a 첫번째 문자열
 * @param b 두번째 문자열
 * @returns 유사도 (0-1 사이 값)
 */
export function calculateSimilarity(a: string, b: string): number {
  if (!a && !b) return 1; // 둘 다 빈 문자열이면 완전히 동일
  if (!a || !b) return 0; // 하나만 빈 문자열이면 완전히 다름

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  // 거리를 최대 길이로 나누어 정규화하고 1에서 빼서 유사도로 변환
  return 1 - distance / maxLength;
}

/**
 * 사용자 입력 텍스트가 정답 텍스트와 얼마나 유사한지 확인합니다.
 *
 * @param userInput 사용자 입력 텍스트
 * @param correctAnswer 정답 텍스트
 * @param threshold 유사도 임계값 (기본값: 0.8)
 * @returns 임계값 이상으로 유사하면 true, 아니면 false
 */
export function isCloseMatch(
  userInput: string,
  correctAnswer: string,
  threshold = 0.8
): boolean {
  if (!userInput || !correctAnswer) return false;

  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();

  // 완전히 동일하면 바로 true
  if (normalizedInput === normalizedCorrect) return true;

  // 유사도 계산
  const similarity = calculateSimilarity(normalizedInput, normalizedCorrect);
  return similarity >= threshold;
}
