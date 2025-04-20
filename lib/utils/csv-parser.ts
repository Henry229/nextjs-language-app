/**
 * CSV 형식의 문자열을 파싱하여 원문과 번역문으로 구성된 데이터 배열로 변환합니다.
 */

export interface CsvSentence {
  id: number;
  originalText: string;
  translatedText: string;
}

/**
 * CSV 문자열을 파싱하여 문장 배열로 변환합니다.
 * @param csvText CSV 형식의 문자열 (원문,번역문 형태)
 * @returns 파싱된 문장 객체 배열
 */
export function parseCsv(csvText: string): CsvSentence[] {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  return csvText
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line, index) => {
      const [originalText, translatedText] = line
        .split(',')
        .map((text) => text?.trim() || '');

      return {
        id: index + 1,
        originalText,
        translatedText,
      };
    });
}

/**
 * 원문과 번역문을 CSV 형식의 문자열로 변환합니다.
 * @param sentences 문장 객체 배열
 * @returns CSV 형식의 문자열
 */
export function convertToCsv(sentences: CsvSentence[]): string {
  if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
    return '';
  }

  return sentences
    .map(
      ({ originalText, translatedText }) => `${originalText},${translatedText}`
    )
    .join('\n');
}

/**
 * 사용자 입력과 정답 문장의 유사도를 간단히 체크합니다.
 * @param userInput 사용자 입력 텍스트
 * @param correctAnswer 정답 텍스트
 * @returns 일치 여부
 */
export function checkSimilarity(
  userInput: string,
  correctAnswer: string
): boolean {
  if (!userInput || !correctAnswer) return false;

  // 기본적인 비교 (공백, 대소문자 무시)
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();

  return normalizedInput === normalizedCorrect;
}
