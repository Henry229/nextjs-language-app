'use client';

import { useState, useRef } from 'react';
import { parseCsv, parsePastedText, CsvSentence } from '@/lib/utils/csv-parser';
import { Card, CARD_STATUS } from '@/types/card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import { useRouter } from 'next/navigation';

interface CsvImportProps {
  onCardsLoaded: (cards: Card[]) => void;
  className?: string;
}

export function CsvImport({ onCardsLoaded, className = '' }: CsvImportProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cards, setCards] = useState<Card[]>([]);

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
        setCards([]);
        return;
      }

      // CSV 데이터에서 Card 형식으로 변환
      const parsedCards = csvData.map((item, index) => ({
        id: index + 1,
        native: item.translatedText, // Korean (번역된 텍스트)
        target: item.originalText, // English (원본 텍스트)
        status: CARD_STATUS.UNSEEN,
      }));

      setCards(parsedCards);
      setIsPasteMode(false);
      setPastedText('');
    } catch (error) {
      setError(
        'CSV 파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해주세요.'
      );
      console.error('CSV 처리 오류:', error);
      setCards([]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTogglePasteMode = () => {
    setIsPasteMode(!isPasteMode);
    setError(null);
    setCards([]);
    setPastedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePastedTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPastedText(e.target.value);

    if (e.target.value.trim() === '') {
      setCards([]);
      setError(null);
      return;
    }

    try {
      const parsedData = parsePastedText(e.target.value);

      if (parsedData.length === 0) {
        setError('붙여넣은 텍스트에 유효한 데이터가 없습니다.');
        setCards([]);
        return;
      }

      // 붙여넣은 텍스트를 카드 형식으로 변환 - 첫 번째 필드(Korean)는 native, 두 번째 필드(English)는 target으로 설정
      const parsedCards = parsedData.map((item, index) => ({
        id: index + 1,
        native: item.translatedText, // Korean (번역된 텍스트)
        target: item.originalText, // English (원본 텍스트)
        status: CARD_STATUS.UNSEEN,
      }));

      setCards(parsedCards);
      setError(null);
    } catch (error) {
      setError('텍스트를 처리하는 중 오류가 발생했습니다.');
      console.error('텍스트 처리 오류:', error);
      setCards([]);
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setError('텍스트 상자가 비어 있습니다.');
      return;
    }

    try {
      const csvData = parsePastedText(pastedText);

      if (csvData.length === 0) {
        setError('유효한 데이터가 포함되지 않았습니다.');
        setCards([]);
        return;
      }

      // CSV 데이터에서 Card 형식으로 변환
      const parsedCards = csvData.map((item: CsvSentence) => ({
        id: item.id,
        native: item.translatedText, // Korean (번역된 텍스트)
        target: item.originalText, // English (원본 텍스트)
        status: CARD_STATUS.UNSEEN,
      }));

      setCards(parsedCards);
      setIsPasteMode(false);
      setPastedText('');
    } catch (error) {
      setError(
        '텍스트 처리 중 오류가 발생했습니다. 올바른 형식인지 확인해주세요.'
      );
      console.error('텍스트 처리 오류:', error);
      setCards([]);
    }
  };

  const handleSubmit = () => {
    if (cards.length === 0) {
      setError('가져올 카드가 없습니다.');
      return;
    }

    // 카드를 localStorage에 저장하고 onCardsLoaded 콜백 호출
    localStorage.setItem('cards', JSON.stringify(cards));
    onCardsLoaded(cards);

    // 학습 페이지로 이동
    router.push('/learn');
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-wrap gap-2'>
          <Button
            onClick={handleButtonClick}
            variant='secondary'
            className={isPasteMode ? 'opacity-70' : ''}
          >
            CSV 파일 선택
          </Button>

          <Button
            onClick={handleTogglePasteMode}
            variant='outline'
            className={!isPasteMode ? 'opacity-70' : ''}
          >
            {isPasteMode ? '파일 업로드로 전환' : '텍스트 붙여넣기로 전환'}
          </Button>

          {fileName && !isPasteMode && (
            <span className='text-sm text-gray-600 self-center'>
              {fileName}
            </span>
          )}

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='.csv'
            className='hidden'
          />
        </div>

        {isPasteMode && (
          <div className='mt-2 space-y-2'>
            <p className='text-sm text-gray-600'>
              한국어와 영어 문장을 붙여넣으세요. 한 줄에 한 쌍씩, 쉼표(,)나
              탭으로 구분:
            </p>
            <TextArea
              value={pastedText}
              onChange={handlePastedTextChange}
              placeholder='안녕하세요, 어떻게 지내세요?&#9;Hello, how are you?\n저는 언어를 공부하는 것을 좋아합니다.&#9;I love to study languages.'
              className='w-full h-32 font-mono text-sm'
            />
            <Button
              onClick={handleProcessPastedText}
              variant='secondary'
              className='mt-2'
              disabled={!pastedText.trim()}
            >
              처리하기
            </Button>
          </div>
        )}

        {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}

        <div className='mt-4 text-sm text-gray-600'>
          <p>데이터 형식: &ldquo;한국어 문장&rdquo;, &ldquo;영어 번역&rdquo;</p>
          <p>
            예시: &ldquo;안녕하세요, 어떻게 지내세요?&rdquo;, &ldquo;Hello, how
            are you?&rdquo;
          </p>
        </div>

        {cards.length > 0 && (
          <div className='space-y-4'>
            <h2 className='text-lg font-medium'>미리보기</h2>
            <div className='border border-gray-200 dark:border-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2'>
              {cards.slice(0, 5).map((card) => (
                <div key={card.id} className='flex space-x-2'>
                  <span className='w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium bg-primary/10 text-primary'>
                    {card.id}
                  </span>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm'>
                      <span className='font-semibold'>한국어:</span>{' '}
                      {card.native}
                    </p>
                    <p className='text-sm'>
                      <span className='font-semibold'>영어:</span> {card.target}
                    </p>
                  </div>
                </div>
              ))}
              {cards.length > 5 && (
                <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                  그리고 {cards.length - 5}개 더...
                </p>
              )}
            </div>
            <div className='flex justify-end'>
              <Button onClick={handleSubmit}>
                {cards.length}개 카드 가져오기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CsvImport;
