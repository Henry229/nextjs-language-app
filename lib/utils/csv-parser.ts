/**
 * CSV 형식의 문자열을 파싱하여 원문과 번역문으로 구성된 데이터 배열로 변환합니다.
 */

export interface CsvSentence {
  id: number;
  originalText: string; // 영어(target) 문장
  translatedText: string; // 한국어(native) 문장
}

/**
 * CSV 문자열을 파싱하여 문장 배열로 변환합니다.
 * @param csvText CSV 형식의 문자열 (한국어,영어 형태)
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
      // 쪽마(,), 탭, 세미콜론(;) 구분자 해당 하는지 확인
      const separator = line.includes(',') ? ',' : line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
      
      // 첫 번째 필드: 한국어(native), 두 번째 필드: 영어(target)
      const [translatedText, originalText] = line
        .split(separator)
        .map((text) => text?.trim() || '');

      return {
        id: index + 1,
        originalText: originalText || '', // 빈 문자열로 처리
        translatedText: translatedText || '', // 빈 문자열로 처리
      };
    });
}

/**
 * 붙여넣기로 입력된 텍스트를 파싱하여 문장 배열로 변환합니다.
 * 쉼표(,)나 탭으로 구분된 형식을 지원합니다.
 * @param pastedText 붙여넣은 텍스트 (각 줄마다 "한국어 문장[구분자]영어 문장" 형식)
 * @returns 파싱된 문장 객체 배열
 */
export function parsePastedText(pastedText: string): CsvSentence[] {
  if (!pastedText || typeof pastedText !== 'string') {
    return [];
  }

  return pastedText
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line, index) => {
      // 쉼표나 탭으로 구분된 형식 지원
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');

      let originalText = ''; // 영어(target) 문장
      let translatedText = ''; // 한국어(native) 문장

      if (parts.length >= 2) {
        // 첫 번째 필드는 한국어(native), 두 번째 필드는 영어(target)
        translatedText = parts[0].trim();
        originalText = parts[1].trim();
      } else if (parts.length === 1) {
        // 구분자가 없는 경우 전체를 한국어로 처리
        translatedText = parts[0].trim();
      }

      return {
        id: index + 1,
        originalText, // 영어 문장 (target)
        translatedText, // 한국어 문장 (native)
      };
    })
    .filter((item) => item.originalText || item.translatedText); // 빈 항목 필터링
}

/**
 * 원문과 번역문을 CSV 형식의 문자열로 변환합니다.
 * 첫 번째 필드는 한국어(native), 두 번째 필드는 영어(target)입니다.
 * @param sentences 문장 객체 배열
 * @returns CSV 형식의 문자열
 */
export function convertToCsv(sentences: CsvSentence[]): string {
  if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
    return '';
  }

  return sentences
    .map(
      ({ translatedText, originalText }) => `${translatedText},${originalText}`
    )
    .join('\n');
}

/**
 * 두 단어 간의 편집 거리(Levenshtein Distance)를 계산합니다.
 * 철자 유사도 검사에 사용됩니다.
 * @param a 첫 번째 단어
 * @param b 두 번째 단어
 * @returns 편집 거리 (낮을수록 유사)
 */
function getEditDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // 행렬 초기화
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // 행렬 채우기
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 삭제
        matrix[i][j - 1] + 1, // 삽입
        matrix[i - 1][j - 1] + cost // 대체
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 두 단어의 유사도를 계산합니다. (0~1 사이 값, 1이 완전 일치)
 * @param a 첫 번째 단어
 * @param b 두 번째 단어
 * @returns 유사도 (0~1)
 */
function getWordSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  // 두 단어의 길이 중 더 긴 것으로 정규화
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1; // 둘 다 빈 단어

  const distance = getEditDistance(a, b);
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * 사용자 입력과 정답 문장의 유사도를 체크합니다.
 * 구두점, 대소문자, 공백 등을 무시하고 핵심 내용이 일치하는지 확인합니다.
 * 단어 순서와 철자 유사도도 계산에 포함됩니다.
 * @param userInput 사용자 입력 텍스트
 * @param correctAnswer 정답 텍스트
 * @returns 일치 여부와 유사도 정보
 */
export function checkSimilarity(
  userInput: string,
  correctAnswer: string
): {
  isCorrect: boolean;
  similarity: number;
  missingWords: string[];
  extraWords: string[];
} {
  if (!userInput || !correctAnswer) {
    return {
      isCorrect: false,
      similarity: 0,
      missingWords: [],
      extraWords: [],
    };
  }

  // 정규화 함수: 구두점 제거, 공백 정리, 소문자 변환
  const normalize = (text: string): string => {
    return (
      text
        .trim()
        .toLowerCase()
        // 마침표, 쉼표, 느낌표, 물음표, 세미콜론, 콜론 등 구두점 제거
        .replace(/[.,!?;:"""''()]/g, '')
        // 연속된 공백을 하나로 줄임
        .replace(/\s+/g, ' ')
    );
  };

  const normalizedInput = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);

  // 완전 일치 체크
  if (normalizedInput === normalizedCorrect) {
    return { isCorrect: true, similarity: 1, missingWords: [], extraWords: [] };
  }

  // 단어 단위 비교
  const inputWords = normalizedInput.split(' ').filter((w) => w.length > 0);
  const correctWords = normalizedCorrect.split(' ').filter((w) => w.length > 0);

  const inputWordSet = new Set(inputWords);
  const correctWordSet = new Set(correctWords);

  // 누락된 단어와 추가된 단어 계산 (정확한 철자 기준)
  const missingWords = correctWords.filter((word) => !inputWordSet.has(word));
  const extraWords = inputWords.filter((word) => !correctWordSet.has(word));

  // 1. 단어 존재 유사도 (Jaccard)
  const unionSize = new Set([...inputWords, ...correctWords]).size;
  const intersectionSize = inputWords.filter((word) =>
    correctWordSet.has(word)
  ).length;
  const jaccardSimilarity = unionSize > 0 ? intersectionSize / unionSize : 0;

  // 2. 철자 유사도 계산 (누락된 단어와 추가된 단어에 대해 유사한 단어 매칭)
  let spellingAdjustment = 0;

  // 누락된 단어와 추가된 단어의 유사도 매칭
  if (missingWords.length > 0 && extraWords.length > 0) {
    const similarPairs: Array<{
      missing: string;
      extra: string;
      similarity: number;
    }> = [];

    // 각 누락 단어에 대해 가장 유사한 추가 단어 찾기
    missingWords.forEach((missing) => {
      extraWords.forEach((extra) => {
        const wordSim = getWordSimilarity(missing, extra);
        if (wordSim > 0.7) {
          // 70% 이상 유사한 경우만 고려
          similarPairs.push({ missing, extra, similarity: wordSim });
        }
      });
    });

    // 유사도가 높은 순으로 정렬
    similarPairs.sort((a, b) => b.similarity - a.similarity);

    // 누락/추가 단어 쌍 중복 방지를 위한 세트
    const processedMissing = new Set<string>();
    const processedExtra = new Set<string>();

    // 유사도 조정값 계산
    for (const pair of similarPairs) {
      if (
        !processedMissing.has(pair.missing) &&
        !processedExtra.has(pair.extra)
      ) {
        spellingAdjustment += pair.similarity * 0.5; // 철자 유사도의 가중치를 0.5로 설정
        processedMissing.add(pair.missing);
        processedExtra.add(pair.extra);
      }
    }

    // 유사한 단어를 찾은 경우 조정
    spellingAdjustment = Math.min(
      spellingAdjustment / Math.max(missingWords.length, extraWords.length),
      0.3 // 최대 0.3 (30%)까지만 조정
    );
  }

  // 3. 단어 순서 유사도 계산 (LCS 기반)
  const lcsMatrix: number[][] = Array(inputWords.length + 1)
    .fill(0)
    .map(() => Array(correctWords.length + 1).fill(0));

  for (let i = 1; i <= inputWords.length; i++) {
    for (let j = 1; j <= correctWords.length; j++) {
      if (inputWords[i - 1] === correctWords[j - 1]) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  const lcsLength = lcsMatrix[inputWords.length][correctWords.length];
  const orderSimilarity = Math.max(
    correctWords.length > 0 ? lcsLength / correctWords.length : 0,
    inputWords.length > 0 ? lcsLength / inputWords.length : 0
  );

  // 4. 최종 유사도 계산 (각 요소의 가중치 조정)
  const jaccardWeight = 0.5; // 단어 존재 유사도 가중치
  const orderWeight = 0.3; // 단어 순서 유사도 가중치
  const spellingWeight = 0.2; // 철자 유사도 가중치

  const combinedSimilarity =
    jaccardSimilarity * jaccardWeight +
    orderSimilarity * orderWeight +
    spellingAdjustment * spellingWeight;

  // 최종 유사도 (0~1 사이로 정규화)
  const similarity = Math.min(1, Math.max(0, combinedSimilarity));

  // 정확도 기준: 80% 이상 일치하고 중요 단어가 누락되지 않은 경우
  // 문장의 길이가 짧을수록 더 엄격한 기준 적용
  const threshold = correctWords.length <= 3 ? 0.85 : 0.75;
  const isCorrect = similarity >= threshold;

  return {
    isCorrect,
    similarity,
    missingWords,
    extraWords,
  };
}
