# 언어 학습 웹 서비스

Next.js 15와 App Router를 사용하여 구현된 단계별 언어 학습 웹 서비스입니다. 사용자의 모국어와 학습할 외국어를 활용하여 효과적인 단계별 학습을 제공합니다.

## 주요 기능

### 1단계: CSV 문장 입력 및 카드 학습
- CSV 파일에서 문장 데이터 불러오기
- Anki 스타일 카드로 학습
- UnrealSpeech를 통한 고품질 TTS 발음 듣기

### 2단계: 음성인식 말하기 연습
- 모국어 문장을 보고 학습 언어로 말하기
- Web Speech API를 활용한 음성 인식(STT)
- 정확도 검증 및 피드백 제공

### 3단계: 상황극 기반 자유 대화
- OpenAI를 활용한 자연스러운 대화 시나리오 생성
- 학습한 문장을 활용한 대화 연습
- 감정 표현이 포함된 음성 합성

## 기술 스택

- **프론트엔드**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **백엔드**: Next.js API Routes, Supabase
- **데이터베이스**: PostgreSQL (Supabase)
- **인증**: Supabase Auth, Google OAuth
- **API**: OpenAI API, UnrealSpeech API, Gemini API, Web Speech API

## 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- npm, yarn, 또는 pnpm
- Supabase 계정
- OpenAI API 키 (GPT-4 지원)
- UnrealSpeech API 키
- Gemini API 키 (선택사항)

### 설치

1. 저장소 클론:
   ```bash
   git clone https://github.com/yourusername/nextjs-language-app.git
   cd nextjs-language-app
   ```

2. 종속성 설치:
   ```bash
   npm install
   # 또는
   yarn install
   # 또는
   pnpm install
   ```

3. 환경 변수 설정:
   - `.env.local.example` 파일을 복사하여 `.env.local` 파일 생성
   - 필요한 API 키와 설정 입력:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     OPENAI_API_KEY=your-openai-api-key
     NEXT_PUBLIC_UNREALSPEECH_API_KEY=your-unrealspeech-api-key
     GEMINI_API_KEY=your-gemini-api-key
     ```

4. Supabase 데이터베이스 설정:
   - `supabase-schema.sql` 파일을 Supabase SQL 편집기에서 실행하여 스키마 생성

5. 개발 서버 실행:
   ```bash
   npm run dev
   # 또는
   yarn dev
   # 또는
   pnpm dev
   ```

6. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 사용 방법

1. **폴더 관리**:
   - 카테고리와 서브카테고리를 생성하여 학습 자료 체계적으로 관리
   - 플래시카드 추가 및 편집

2. **학습 진행**:
   - 홈페이지에서 '학습 시작하기' 버튼 클릭
   - 단계별로 학습 진행 (1단계 → 2단계 → 3단계)
   - 각 단계 완료 후 다음 단계로 이동

3. **CSV 형식**:
   - 1열: 한국어 문장
   - 2열: 영어 문장
   - 예시: "안녕하세요","Hello"

## 기여 방법

프로젝트에 기여하고 싶으시다면:

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다.

## 문의

질문이나 피드백이 있으시면 이슈를 열어주세요.
