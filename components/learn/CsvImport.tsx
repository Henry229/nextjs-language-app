'use client';

import { useState, useRef } from 'react';
import { parseCsv } from '@/lib/utils/csv-parser';
import { Card, CARD_STATUS } from '@/types/card';
import Button from '@/components/ui/Button';

interface CsvImportProps {
  onCardsLoaded: (cards: Card[]) => void;
  className?: string;
}

export function CsvImport({ onCardsLoaded, className = '' }: CsvImportProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const csvData = parseCsv(text);

      if (csvData.length === 0) {
        setError('유효한 데이터가 포함되지 않았습니다.');
        return;
      }

      // CSV 데이터에서 Card 형식으로 변환
      const cards: Card[] = csvData.map((item) => ({
        id: item.id,
        native: item.translatedText, // 한국어(번역문)를 native로
        target: item.originalText, // 영어(원문)를 target으로
        status: CARD_STATUS.UNSEEN,
      }));

      onCardsLoaded(cards);
    } catch (err) {
      setError(
        'CSV 파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해주세요.'
      );
      console.error('CSV 처리 오류:', err);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='flex flex-col space-y-4'>
        <div className='flex items-center space-x-4'>
          <Button onClick={handleButtonClick} variant='secondary'>
            CSV 파일 선택
          </Button>

          {fileName && (
            <span className='text-sm text-gray-600'>{fileName}</span>
          )}

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='.csv'
            className='hidden'
          />
        </div>

        {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}

        <div className='mt-4 text-sm text-gray-600'>
          <p>
            CSV 파일 형식: &ldquo;영어 문장&rdquo;, &ldquo;한국어 번역&rdquo;
          </p>
          <p>
            예시: &ldquo;Hello, how are you?&rdquo;, &ldquo;안녕하세요, 어떻게
            지내세요?&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

export default CsvImport;
