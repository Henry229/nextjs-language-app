'use client';

import React, { useState, useEffect } from 'react';
import { Flashcard } from '@/types/card';
import { deleteFlashcard, createFlashcardsFromCSV } from '@/lib/supabase/api';
import { parseCsv, CsvSentence } from '@/lib/utils/csv-parser';

interface FlashcardListProps {
  flashcards: Flashcard[];
  subcategoryId: string;
  refreshAction?: (id?: string) => Promise<Flashcard[]>;
}

export default function FlashcardList({
  flashcards: initialFlashcards,
  subcategoryId,
  refreshAction,
}: FlashcardListProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);

  // initialFlashcards가 변경되면 state 업데이트
  useEffect(() => {
    setFlashcards(initialFlashcards);
  }, [initialFlashcards]);

  const handleImportToggle = () => {
    setIsImporting(!isImporting);
    setError(null);
    setSuccess(null);
  };

  const refreshData = async () => {
    if (refreshAction) {
      try {
        // 서버 액션 호출하여 최신 데이터 가져오기
        const updatedFlashcards = await refreshAction(subcategoryId);
        // 데이터를 클라이언트 상태로 업데이트 (페이지 새로고침 없음)
        setFlashcards(updatedFlashcards);
      } catch (error) {
        console.error('새로고침 중 오류 발생:', error);
        // 오류 발생시 기본 방식으로 폴백
        window.location.reload();
      }
    } else {
      // 기존 방식: 페이지 새로고침
      window.location.reload();
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvText.trim()) {
      setError('CSV 데이터를 입력해주세요.');
      return;
    }

    try {
      setError(null);

      // CSV 파싱
      const parsedData = parseCsv(csvText);

      if (parsedData.length === 0) {
        setError('유효한 데이터를 찾을 수 없습니다.');
        return;
      }

      // 플래시카드 형식으로 변환 (공백 체크 추가)
      const flashcardsToImport = parsedData
        .filter((row: CsvSentence) => row.originalText && row.originalText.trim() !== '') // foreign_text가 비어있지 않은 항목만 필터링
        .map((row: CsvSentence) => ({
          native_text: row.translatedText || '번역 없음', // 반드시 값이 있도록 기본값 지정
          foreign_text: row.originalText, // 이미 필터링되어 공백이 아님
        }));

      // 에러 메시지 처리 개선
      if (flashcardsToImport.length === 0) {
        setError('유효한 플래시카드 데이터가 없습니다. 학습 언어 칼럼은 반드시 값이 있어야 합니다.');
        return;
      }

      try {
        // Supabase에 저장
        await createFlashcardsFromCSV(subcategoryId, flashcardsToImport);

        setSuccess(
          `${flashcardsToImport.length}개의 플래시카드를 성공적으로 가져왔습니다.`
        );
        setCsvText('');
        await refreshData();

        // 성공 메시지를 3초 후 숨김
        setTimeout(() => {
          setSuccess(null);
          setIsImporting(false);
        }, 3000);
      } catch (err: unknown) {
        // 자세한 오류 메시지 표시
        let errorMessage = 'CSV 가져오기 중 오류가 발생했습니다.';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null) {
          // Supabase 오류 객체 처리
          const errorObj = err as any;
          if (errorObj.message) {
            errorMessage = errorObj.message;
            
            // foreign_text null 에러일 경우 더 자세히 설명
            if (errorMessage.includes('foreign_text') && errorMessage.includes('null value')) {
              errorMessage = '학습 언어 칼럼에 빈 값이 있습니다. 모든 행의 두 번째 칼럼(학습 언어)에 값이 있는지 확인해주세요.';
            }
          }
        }
        
        setError(errorMessage);
        console.error('Error importing CSV:', err);
      }
    } catch (err: unknown) {
      setError('CSV 파싱 중 오류가 발생했습니다.');
      console.error('Error parsing CSV:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 플래시카드를 삭제하시겠습니까?')) {
      try {
        setIsDeleting((prev) => ({ ...prev, [id]: true }));
        await deleteFlashcard(id);
        await refreshData();
      } catch (err: unknown) {
        console.error('Error deleting flashcard:', err);
        alert('플래시카드 삭제 중 오류가 발생했습니다.');
      } finally {
        setIsDeleting((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>
          플래시카드 ({flashcards.length}개)
        </h2>
        <button
          onClick={handleImportToggle}
          className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700'
        >
          {isImporting ? '가져오기 취소' : 'CSV 가져오기'}
        </button>
      </div>

      {isImporting && (
        <div className='p-4 border border-gray-200 rounded-lg bg-white shadow-sm'>
          <h3 className='text-lg font-medium mb-3'>CSV 데이터 가져오기</h3>
          <p className='text-sm text-gray-500 mb-4'>
            CSV 형식의 데이터를 입력하세요. 첫 번째 열은 모국어, 두 번째 열은
            학습 언어입니다.
            <br />
            예: 안녕하세요,Hello
          </p>

          <form onSubmit={handleCSVImport}>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded h-32 mb-4'
              placeholder='예시:&#10;안녕하세요,Hello&#10;감사합니다,Thank you&#10;좋은 하루 되세요,Have a nice day'
            />

            {error && (
              <div className='p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md'>
                {error}
              </div>
            )}

            {success && (
              <div className='p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md'>
                {success}
              </div>
            )}

            <div className='flex justify-end'>
              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700'
              >
                가져오기
              </button>
            </div>
          </form>
        </div>
      )}

      {flashcards.length === 0 ? (
        <div className='p-6 text-center text-gray-500 border border-gray-200 rounded-lg'>
          이 폴더에는 플래시카드가 없습니다. CSV 가져오기로 플래시카드를
          추가해보세요.
        </div>
      ) : (
        <div className='border border-gray-200 rounded-lg overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  모국어
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  학습 언어
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  작업
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {flashcards.map((card) => (
                <tr key={card.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {card.native_text}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {card.foreign_text}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={isDeleting[card.id]}
                      className='text-red-600 hover:text-red-900 disabled:text-gray-400'
                    >
                      {isDeleting[card.id] ? '삭제 중...' : '삭제'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}