'use client';

import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../../../lib/hooks/useSpeechRecognition';

export default function Stage4Page() {
  const [targetPhrase, setTargetPhrase] = useState<string>(
    'Hello, how are you today?'
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-gray-500');

  const {
    transcript,
    isListening,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition({
    language: 'en-US',
    continuous: false,
    interimResults: true,
  });

  // 음성 인식 중인 경우 자동으로 평가
  useEffect(() => {
    if (!isListening && transcript) {
      evaluateSpeech();
    }
  }, [isListening, transcript]);

  // 새 문구 생성
  const generateNewPhrase = () => {
    const phrases = [
      'Hello, how are you today?',
      'I would like to order a coffee please.',
      'What time does the movie start?',
      'Could you please help me find my way?',
      'The weather is really nice today.',
      'I need to catch the next train to London.',
    ];

    const newPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setTargetPhrase(newPhrase);
    resetTranscript();
    setFeedbackMessage('');
  };

  // 말하기 평가
  const evaluateSpeech = () => {
    if (!transcript) {
      setFeedbackMessage('음성이 인식되지 않았습니다. 다시 시도해 주세요.');
      setFeedbackColor('text-amber-500');
      return;
    }

    const cleanTranscript = transcript.toLowerCase().trim();
    const cleanTarget = targetPhrase.toLowerCase().trim();

    const similarity = calculateSimilarity(cleanTranscript, cleanTarget);

    if (similarity > 0.8) {
      setFeedbackMessage('훌륭합니다! 정확하게 말했습니다.');
      setFeedbackColor('text-green-600');
    } else if (similarity > 0.5) {
      setFeedbackMessage(
        '괜찮습니다. 대체로 정확했지만 조금 더 연습이 필요합니다.'
      );
      setFeedbackColor('text-amber-500');
    } else {
      setFeedbackMessage('다시 시도해보세요. 천천히 정확하게 발음해보세요.');
      setFeedbackColor('text-red-500');
    }
  };

  // 단순 유사도 계산 (실제로는 더 정교한 알고리즘 사용 필요)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');

    let matchCount = 0;
    words1.forEach((word) => {
      if (words2.includes(word)) {
        matchCount++;
      }
    });

    return matchCount / Math.max(words1.length, words2.length);
  };

  // 말하기 시작
  const handleStartSpeaking = () => {
    resetTranscript();
    setFeedbackMessage('');
    startListening();
  };

  return (
    <div className='max-w-3xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>4단계: 음성인식 말하기 연습</h1>

      {!hasRecognitionSupport && (
        <div className='p-4 bg-red-100 text-red-700 rounded mb-4'>
          브라우저가 음성 인식을 지원하지 않습니다. 크롬 브라우저에서 이용해
          주세요.
        </div>
      )}

      {error && (
        <div className='p-4 bg-red-100 text-red-700 rounded mb-4'>
          오류: {error}
        </div>
      )}

      <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md mb-6 border border-[hsl(var(--border))]'>
        <h2 className='text-lg font-semibold mb-2'>다음 문장을 말해보세요:</h2>
        <p className='text-xl p-4 bg-[hsl(var(--secondary))] rounded-md mb-4 font-medium'>
          {targetPhrase}
        </p>

        <div className='flex gap-2 mb-4'>
          <button
            onClick={handleStartSpeaking}
            disabled={isListening}
            className={`px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded ${
              isListening
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-opacity-90'
            }`}
          >
            {isListening ? '듣는 중...' : '말하기 시작'}
          </button>

          <button
            onClick={stopListening}
            disabled={!isListening}
            className={`px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded ${
              !isListening
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-opacity-90'
            }`}
          >
            중지
          </button>

          <button
            onClick={generateNewPhrase}
            className='px-4 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] rounded hover:bg-opacity-90'
          >
            새 문장
          </button>
        </div>

        {transcript && (
          <div className='mb-4'>
            <h3 className='font-medium mb-1'>인식된 내용:</h3>
            <p className='p-3 bg-[hsl(var(--muted))] rounded'>{transcript}</p>
          </div>
        )}

        {feedbackMessage && (
          <div className='mt-4'>
            <h3 className='font-medium mb-1'>피드백:</h3>
            <p className={`p-3 rounded ${feedbackColor}`}>{feedbackMessage}</p>
          </div>
        )}
      </div>

      <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
        <h2 className='text-lg font-semibold mb-2'>말하기 연습 도움말</h2>
        <ul className='list-disc pl-5 space-y-2'>
          <li>명확하게 발음하되 자연스러운 속도로 말하세요.</li>
          <li>조용한 환경에서 연습하면 더 좋은 결과를 얻을 수 있습니다.</li>
          <li>마이크가 제대로 작동하는지 확인하세요.</li>
          <li>
            한 번에 완벽하게 하려고 노력하지 마세요. 꾸준한 연습이 중요합니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
