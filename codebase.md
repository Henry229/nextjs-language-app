# .cursor/rules/coding-rule.mdc

```mdc
---
description: 
globs: 
alwaysApply: true
---

You are an expert in Next.js 15 (App Router), TypeScript, Tailwind CSS, and Shadcn UI development.

Key Principles
- Write concise, technical TypeScript code with accurate Next.js 15 examples.
- Always use the App Router (`app/` directory structure), never Pages Router.
- Prefer Server Components (RSC) by default; minimize usage of `'use client'`.
- Use functional, declarative programming patterns. Avoid class components.
- Favor iteration and modularization over duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Use lowercase with dashes for directory names (e.g., components/auth-wizard).
- Favor named exports for components and functions.
- Structure files clearly: exported component, subcomponents, helpers, static content, types.

TypeScript Usage
- Use TypeScript strictly for all files.
- Prefer interfaces over types for object shapes.
- Avoid enums; prefer union types or map objects.
- Use the `function` keyword for components and pure functions.
- Omit unnecessary curly braces for single-line conditionals.
- Write readable, declarative JSX.

React and Next.js Best Practices
- Use `use client` only when necessary (e.g., for browser APIs, user interactions).
- Prefer Server Actions for form handling and mutations when possible.
- Use Suspense and loading.tsx for graceful loading states.
- Use error.tsx and global-error.tsx to handle errors gracefully.
- Implement dynamic imports with `next/dynamic` for non-critical components.
- Optimize all images using Next.js `<Image>` with lazy loading and size attributes.

Styling (Tailwind CSS & Shadcn UI)
- Always use Tailwind CSS classes for styling; avoid traditional CSS files.
- Use Shadcn UI components for all common UI elements (e.g., button, input).
- Apply Tailwind's mobile-first responsive design philosophy.
- Group Tailwind classes logically for readability (layout > spacing > typography > colors > effects).
- Prefer `className` utilities like `clsx` or `classnames` if dynamic classes are needed.

Project Structure
- Follow feature-based folder structure under `app/`.
- Place page-level components in `app/{route}/page.tsx`.
- Use `components/`, `lib/`, `hooks/`, `utils/`, `types/` directories for organization.
- Place static content, constants, and interfaces at the bottom of files.

Error Handling
- Use early returns to handle invalid states.
- Model expected errors as return values when possible, avoid try/catch for normal flows.
- For unexpected errors, use error boundaries.

Naming Conventions
- Booleans: isLoading, hasError, shouldRedirect
- Directory names: lowercase-with-dashes
- Component file names: PascalCase (e.g., UserCard.tsx)
- Utility/helper file names: camelCase (e.g., fetchUserData.ts)

Testing and Quality
- Ensure code is DRY (Don't Repeat Yourself) and SRP (Single Responsibility Principle) compliant.
- Write complete, bug-free, ready-to-run code.
- Include all required imports.
- Write accessible HTML: use `aria-` attributes, `tabIndex`, `role` appropriately.
- Never leave TODOs, placeholders, or missing pieces.

Documentation and References
- Always refer to official documentation: Next.js, React, TypeScript, Tailwind CSS, and Shadcn UI.
- Stay up-to-date with best practices and latest framework capabilities.

Focus
- Prioritize clean, readable, maintainable code over premature optimization.
- Ensure performance, accessibility, and SEO are considered in all components.


```

# .doc/refactory.md

```md
- 헤더의 "영작 연습" 링크를 변경하여 클릭 시 '/learn/stage1'이 아닌 '/folders' 페이지로 이동하도록 수정했습니다. 이를 통해 사용자가 영작 연습을 할 때 폴더를 먼저 선택하도록 하여 환경을 개선했습니다.- 서버 액션(Server Action) 함수 사용 방식 오류 수정
  - 서버 액션 함수를 클라이언트 컴포넌트에 전달할 때 `use server` 지시문을 포함하는 오류 해결
  - 익명 함수로 호출하는 형태로 전달하는 문제를 서버 액션 함수를 직접 전달하는 방식으로 변경
  - `app/folders/[categoryId]/page.tsx`와 `app/folders/[categoryId]/[subcategoryId]/page.tsx`에서 액션 필요
  - `FolderList`와 `FlashcardList` 컴포넌트 타입 정의 수정하여 `refreshAction` 함수가 매개변수를 받을 수 있도록 변경
  - 함수 호출 부분도 수정하여 서버 액션에 필요한 ID 매개변수를 전달하도록 구현# Next.js 15 언어 학습 앱 리팩토링 문서

## 현재 수정 완료된 사항

- Next.js 15의 서버 컴포넌트에서 `dynamic` 임포트 시 `ssr: false` 옵션 사용 오류 수정
  - 서버 컴포넌트인 `app/folders/page.tsx`에서 `ssr: false` 옵션을 제거하여 에러 해결
- 서버 컴포넌트에서 클라이언트 컴포넌트로 함수 전달 문제를 서버 액션(Server Actions)을 사용하여 개선
  - `app/folders/page.tsx`에 `refreshCategories` 서버 액션 추가 - 서버에서 최신 카테고리 데이터를 가져옴
  - `FolderList` 컴포넌트에서 `onRefresh` 대신 `refreshAction` prop 사용
  - `FolderList` 컴포넌트에 로컬 state를 추가하여 새로고침 없이 데이터 업데이트 구현
  - 서버 액션을 사용하여 페이지를 리로드하지 않고도 데이터를 갱신할 수 있도록 개선
- Next.js 15의 `cookies()` 함수 사용 관련 오류 수정
  - `lib/supabase/server.ts`, `app/api/auth/callback/route.ts`, `app/api/auth/signout/route.ts`에서 Next.js 15에 맞게 `cookies`를 사용하도록 수정
  - 이전 방식: `cookies: () => cookies()` 또는 `cookies: () => cookieStore` 방식은 Next.js 15에서 cookies().get() 메서드를 비동기 처리해야 하는데 처리하지 않아 에러 발생
  - 수정 방식: `cookies` 함수 자체를 전달하도록 변경하여 Supabase 클라이언트가 내부적으로 올바르게 처리하도록 함
  - `app/folders/page.tsx`에서 Subcategory 타입 임포트 추가로 타입 오류 해결
- 폴더 관리 페이지의 폴더 생성 버튼 스타일링 문제 해결
  - `components/folders/FolderList.tsx`에서 정의되지 않은 `bg-primary` 클래스를 테일윈드의 기본 클래스인 `bg-blue-600`으로 변경
  - 버튼이 화면에 표시되지 않는 문제 해결
- 날짜 형식의 서버-클라이언트 불일치로 인한 하이드레이션 오류 수정
  - `components/folders/FolderItem.tsx`에서 `toLocaleDateString()`을 사용하는 방식에서 ISO 형식을 기반으로 한 일관된 날짜 포맷으로 변경
  - 클라이언트의 로케일 설정과 무관하게 서버와 클라이언트 간 동일한 날짜 형식을 표시하도록 수정
- 서버 컴포넌트에서 클라이언트 컴포넌트로 이벤트 핸들러 함수를 전달하는 문제 수정
  - 서버 액션(Server Actions)을 활용하여 오류 해결
  - `app/folders/[categoryId]/page.tsx`와 `app/folders/[categoryId]/[subcategoryId]/page.tsx`에서 `onRefresh` 대신 `refreshAction` prop과 서버 액션 함수 사용
  - 서버 컴포넌트에서 `refreshSubcategories`와 `refreshFlashcards` 서버 액션 추가
  - `FlashcardList.tsx` 컴포넌트를 업데이트하여 `refreshAction` prop을 통해 서버 액션을 지원하도록 수정

## 다음 단계 계획

다음 단계로는 폴더 관리 기능과 플래시카드 학습 기능을 통합하고, 시스템 전체 테스트를 진행해야 합니다.

1. 데이터 마이그레이션 및 통합
   - localStorage에서 Supabase로 데이터 마이그레이션 기능 구현
   - [x] 학습 페이지에서 서브카테고리 ID를 기반으로 플래시카드를 로드하도록 수정
   - 사용자별 학습 진행 상황 저장 및 조회 기능 구현

2. 인증 시스템 테스트
   - 회원가입 및 로그인 테스트
   - Google OAuth 로그인 테스트
   - 인증 상태에 따른 컨텐츠 표시/제한 테스트

3. 전체 시스템 테스트
   - [x] 폴더 페이지 에러 수정 (dynamic import, 서버 컴포넌트 관련 오류, 날짜 하이드레이션 오류)
   - [ ] 각 학습 단계 전환 테스트
   - [ ] 인증 상태 유지 테스트
   - [ ] 폴더 관리 및 플래시카드 기능 통합 테스트
   - [ ] 오류 처리 및 예외 상황 대응 개선
   - [ ] 접근성 및 UX 개선

4. 최종 배포 준비
   - 성능 최적화 및 코드 정리
   - 전체 앱 테스트
   - 사용자 피드백 수집 준비
   - 기능 개선 및 플래시카드 통합 테스트

## 현재 진행 상황

### 최근 수정 사항

- 헤더의 "영작 연습" 링크를 변경하여 클릭 시 '/learn/stage1'이 아닌 '/folders' 페이지로 이동하도록 수정했습니다. 이를 통해 사용자가 영작 연습을 할 때 폴더를 먼저 선택하도록 하여 환경을 개선했습니다.

- 폴더 페이지에서 '플래시카드 학습하기' 버튼을 '영작 연습하기'로 변경하고, 클릭 시 stage2 대신 stage1 페이지로 이동하도록 수정했습니다.
- Stage1 페이지(app/learn/stage1/page.tsx)와 Stage2 페이지(app/learn/stage2/page.tsx)를 수정하여 URL의 subcategoryId 파라미터를 기반으로 Supabase에서 플래시카드를 불러오도록 구현했습니다.
- Stage1 페이지에서 subcategoryId 파라미터가 있을 경우 자동으로 영작 연습을 시작하도록 구현하여, CSV 업로드 화면을 건너문 필요가 없도록 개선했습니다.
- 플래시카드의 Supabase 데이터가 Card 형식으로 변환되어 로컬 스토리지에도 저장되어 다음 단계(스테이지 2, 3, 4)에서도 사용가능하도록 구현했습니다.

- 모든 페이지(app/page.tsx, app/learn/page.tsx, 스테이지 1~4)가 완성되었습니다.
- 반응형 디자인이 적용되어 모든 화면 크기에 최적화되었습니다.
- Tailwind CSS를 활용한 일관된 디자인 시스템이 적용되었습니다.
- HSL 색상 변수를 사용해 테마 시스템의 기초가 마련되었습니다.
- 클라이언트 컴포넌트와 서버 컴포넌트의 구분이 적절히 이루어졌습니다.
- 페이지 간 네비게이션 구조가 직관적으로 구성되었습니다.
- 기본 상태 관리가 구현되었으며, 로컬 스토리지를 활용한 데이터 유지가 가능합니다.
- 유틸리티 및 훅 파일들이 모두 구현되어 기능 모듈화가 완료되었습니다.
- 음성 인식 및 TTS 관련 타입과 서비스가 구현되어 Stage4 기능이 작동합니다.
- 기본 UI 컴포넌트(Button, TextInput, ErrorMessage)가 모두 구현되었습니다.
- 레이아웃 컴포넌트(Header, Footer)가 완성되었고 전체 앱에 적용되었습니다.
- Root Layout이 업데이트되어 Header와 Footer가 모든 페이지에 적용되었습니다.
- CsvImport 컴포넌트의 로컬 스토리지 키 불일치 버그를 수정했습니다.
- CsvImport 컴포넌트에서 불필요한 라우팅을 제거하여 현재 페이지에 머무르도록 수정했습니다.
- Stage1Exercise 컴포넌트에서 checkSimilarity 함수의 반환값을 잘못 사용하는 버그를 수정했습니다.
- Stage1Exercise 컴포넌트에 피드백 메시지를 개선하여, 유사도와 누락 단어에 대한 정보를 표시하도록 개선했습니다.
- useSpeechRecognition 훅에서 무한 루프 오류를 수정했습니다.
- Supabase 연동을 위한 클라이언트 및 서버 유틸리티가 구현되었습니다.
- 인증 시스템이 구현되었으며, 이메일/패스워드 로그인과 Google OAuth 로그인을 지원합니다.
- 데이터베이스 스키마가 설계되고 적용되어 카테고리, 서브카테고리, 플래시카드, 사용자 진행 상황을 저장할 수 있습니다.
- 인증 관련 컴포넌트들이 구현되어 사용자 프로필 표시, 로그아웃 기능, 인증 상태에 따른 보호 기능을 제공합니다.
- 헤더 컴포넌트가 업데이트되어 사용자 프로필과 로그인/로그아웃 기능이 추가되었습니다.
- 미들웨어가 설정되어 인증 상태에 따른 페이지 접근 제어와 Supabase 쿠키 관리가 가능합니다.
- Row Level Security(RLS)가 적용되어 데이터 접근 권한이 사용자별로 제한됩니다.
- 데이터베이스 스키마가 업데이트되어 카테고리, 서브카테고리, 플래시카드 테이블에 user_id 컴럼이 추가되었습니다.
- RLS 정책이 업데이트되어 각 사용자가 자신의 데이터만 접근할 수 있도록 제한되었습니다.
- 카드 타입 정의가 Supabase 데이터베이스 스키마에 맞게 업데이트되었습니다.
- Supabase API 함수가 구현되어 데이터베이스와의 CRUD 작업을 쉽게 수행할 수 있습니다.
- 폴더 관리 기능이 구현되었으며, 계층적으로 관리할 수 있습니다.
- 폴더 생성, 편집, 삭제 기능이 모두 구현되었습니다.
- CSV 가져오기를 통해 플래시카드를 대량으로 추가할 수 있는 기능이 구현되었습니다.
- 헤더에 폴더 관리 메뉴가 추가되어 쉽게 접근할 수 있습니다.
- 서버 컴포넌트와 클라이언트 컴포넌트의 조합을 통해 데이터 로딩과 UI 상호작용을 효과적으로 분리했습니다.
- Next.js 15의 서버 컴포넌트, 클라이언트 컴포넌트, 서버 액션을 이용한 효율적인 데이터 갱신 기능이 구현되었습니다.사용자 프로필 표시, 로그아웃 기능, 인증 상태에 따른 보호 기능을 제공합니다.
- 헤더 컴포넌트가 업데이트되어 사용자 프로필과 로그인/로그아웃 기능이 추가되었습니다.
- 미들웨어가 설정되어 인증 상태에 따른 페이지 접근 제어와 Supabase 쿠키 관리가 가능합니다.
- Row Level Security(RLS)가 적용되어 데이터 접근 권한이 사용자별로 제한됩니다.
- 데이터베이스 스키마가 업데이트되어 카테고리, 서브카테고리, 플래시카드 테이블에 user_id 컬럼이 추가되었습니다.
- RLS 정책이 업데이트되어 각 사용자가 자신의 데이터만 접근할 수 있도록 제한되었습니다.
- 카드 타입 정의가 Supabase 데이터베이스 스키마에 맞게 업데이트되었습니다.
- Supabase API 함수가 구현되어 데이터베이스와의 CRUD 작업을 쉽게 수행할 수 있습니다.
- 폴더 관리 기능이 구현되었으며, 계층적으로 관리할 수 있습니다.
- 폴더 생성, 편집, 삭제 기능이 모두 구현되었습니다.
- CSV 가져오기를 통해 플래시카드를 대량으로 추가할 수 있는 기능이 구현되었습니다.
- 헤더에 폴더 관리 메뉴가 추가되어 쉽게 접근할 수 있습니다.
- 서버 컴포넌트와 클라이언트 컴포넌트의 조합을 통해 데이터 로딩과 UI 상호작용을 효과적으로 분리했습니다.
```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# documentation
/.doc/


```

# .vscode/settings.json

```json
{
  "workbench.colorCustomizations": {
    "activityBar.activeBackground": "#fbed80",
    "activityBar.background": "#fbed80",
    "activityBar.foreground": "#15202b",
    "activityBar.inactiveForeground": "#15202b99",
    "activityBarBadge.background": "#06b9a5",
    "activityBarBadge.foreground": "#15202b",
    "commandCenter.border": "#15202b99",
    "sash.hoverBorder": "#fbed80",
    "statusBar.background": "#f9e64f",
    "statusBar.foreground": "#15202b",
    "statusBarItem.hoverBackground": "#f7df1e",
    "statusBarItem.remoteBackground": "#f9e64f",
    "statusBarItem.remoteForeground": "#15202b",
    "titleBar.activeBackground": "#f9e64f",
    "titleBar.activeForeground": "#15202b",
    "titleBar.inactiveBackground": "#f9e64f99",
    "titleBar.inactiveForeground": "#15202b99"
  },
  "peacock.color": "#f9e64f"
}

```

# app/api/auth/callback/route.ts

```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

// OAuth 및 이메일 로그인 후 리디렉션을 처리하는 라우트
export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Next.js 15에서는 cookies 함수를 사용하기 전에 await 해야 함
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 인증 성공 후 리디렉션할 페이지
  return NextResponse.redirect(new URL('/', requestUrl.origin));
};

```

# app/api/auth/signout/route.ts

```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

// 로그아웃 처리를 위한 API 라우트
export const POST = async (request: NextRequest) => {
  // Next.js 15에서는 cookies 함수를 사용하기 전에 await 해야 함
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  // 로그아웃 처리
  await supabase.auth.signOut();
  
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  });
};

```

# app/api/chat/route.ts

```ts
// app/api/chat/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// OpenAI 타입 정의
type OpenAIInstance = InstanceType<typeof OpenAI>;

// Initialize OpenAI client using environment variable
// IMPORTANT: Store your API key in .env.local as OPENAI_API_KEY
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAIInstance | null = null;

if (openaiApiKey) {
  openai = new OpenAI({ apiKey: openaiApiKey });
} else {
  console.error('Chat API Route: OPENAI_API_KEY environment variable not set.');
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
}

export async function POST(request: NextRequest) {
  // Check if the client was initialized (API key was present)
  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI client not initialized. Check API Key.' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body to get the message history
    const body = (await request.json()) as RequestBody;
    // Expecting messages in the format: [{ role: 'user'/'assistant', content: '...' }, ...]
    const { messages } = body;

    // Validate the messages input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid "messages" array in request body' },
        { status: 400 }
      );
    }

    console.log('API Route Chat: Calling OpenAI Chat Completion API...');

    // Call the OpenAI Chat Completions API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Specify the model (e.g., "gpt-4")
      messages: messages, // Pass the conversation history
      // temperature: 0.7,    // Optional: Control randomness
      // max_tokens: 150,     // Optional: Limit response length
    });

    // Extract the AI's reply from the response
    const reply = completion.choices[0]?.message?.content;

    // Check if a valid reply was received
    if (reply) {
      console.log('API Route Chat: Received reply from OpenAI:', reply);
      // Return the AI's reply as JSON
      return NextResponse.json({ reply: reply.trim() });
    } else {
      // Handle cases where the response structure might be unexpected
      console.error(
        'API Route Chat: No valid reply content found in OpenAI response:',
        completion
      );
      throw new Error('Failed to get valid content from OpenAI response');
    }
  } catch (error) {
    console.error('API Route Chat: Error calling OpenAI API:', error);
    // Return a JSON error response in case of failure
    return NextResponse.json(
      { error: 'Failed to get AI response', details: (error as Error).message },
      { status: 500 }
    );
  }
}

```

# app/api/gemini-tts/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiAudio } from '@/lib/services/gemini-tts-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, speed } = body;

    // 필수 인자 검증
    if (!text) {
      return NextResponse.json(
        { error: '텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // Gemini API 호출하여 음성 생성
    const result = await generateGeminiAudio({
      text,
      voice,
      speed,
    });

    // 오류가 있는 경우
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 성공 응답
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Gemini TTS API 오류:', error);
    return NextResponse.json(
      {
        error: 'Gemini TTS 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

```

# app/api/podcast/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePodcastContent } from '@/lib/services/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentence, nativeSentence } = body;

    // 필수 인자 검증
    if (!sentence) {
      return NextResponse.json(
        { error: '문장(sentence)이 필요합니다.' },
        { status: 400 }
      );
    }

    // Gemini API 호출하여 콘텐츠 생성
    const podcastContent = await generatePodcastContent({
      sentence,
      nativeSentence,
    });

    // 오류가 있는 경우
    if (podcastContent.error) {
      return NextResponse.json(
        { error: podcastContent.error },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json(podcastContent, { status: 200 });
  } catch (error) {
    console.error('Podcast API 오류:', error);
    return NextResponse.json(
      {
        error: '팟캐스트 콘텐츠 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

```

# app/api/tts/route.js

```js
// app/api/tts/route.js
import { NextResponse } from 'next/server';

// Initialize Unreal Speech API credentials
// IMPORTANT: Store your API key in .env.local
const UNREALSPEECH_API_KEY = process.env.UNREAL_SPEECH_API_KEY;

// Check for API key
if (!UNREALSPEECH_API_KEY) {
  console.error(
    'TTS API Route: UNREAL_SPEECH_API_KEY environment variable not set.'
  );
}

export async function POST(request) {
  console.log('TTS API Route: Received request');

  // Check if API key is present
  if (!UNREALSPEECH_API_KEY) {
    console.error('TTS API Route: API key not configured');
    return NextResponse.json(
      { error: 'UnrealSpeech API key not configured.' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body to get the text and other parameters
    const body = await request.json();
    console.log('TTS API Route: Request body', JSON.stringify(body));

    const {
      text,
      voiceId = 'Sierra', // Updated to use a supported voice
      speed = -0.2,
      pitch = 1,
      outputFormat = 'mp3',
    } = body;

    // Validate required 'text' parameter
    if (!text) {
      console.error('TTS API Route: Missing "text" in request body');
      return NextResponse.json(
        { error: 'Missing "text" in request body' },
        { status: 400 }
      );
    }

    console.log(
      `API Route TTS: Generating speech for "${text}" with voice ${voiceId}`
    );

    // UnrealSpeech v8 API endpoint
    const apiUrl = 'https://api.v8.unrealspeech.com/stream';

    // Prepare request payload
    const payload = {
      Text: text,
      VoiceId: voiceId,
      Speed: speed,
      Pitch: pitch,
      OutputFormat: outputFormat,
    };

    console.log(
      'TTS API Route: Sending request to UnrealSpeech with payload',
      JSON.stringify(payload)
    );

    // Call the UnrealSpeech v8 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${UNREALSPEECH_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // Check if API call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Route TTS: Error from UnrealSpeech API: ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to generate speech', details: errorText },
        { status: response.status }
      );
    }

    console.log('API Route TTS: Received audio stream.');

    // Get audio data
    const audioBuffer = await response.arrayBuffer();

    // Create response with appropriate headers
    return new Response(Buffer.from(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      },
      status: 200,
    });
  } catch (error) {
    console.error('API Route TTS: Error calling UnrealSpeech API:', error);
    // Return a JSON error response in case of failure
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    );
  }
}

```

# app/auth/login/page.tsx

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.refresh();
      router.push('/');
    } catch (error: any) {
      setError(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Google 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">로그인</h1>
          <p className="mt-2 text-gray-600">
            언어 학습 웹 서비스에 오신 것을 환영합니다.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? '로그인 중...' : '이메일로 로그인'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.643 2.03-2.399 3.458-5.445 3.458-3.314 0-6-2.686-6-6s2.686-6 6-6c1.464 0 2.792 0.532 3.826 1.409l2.778-2.778c-1.773-1.649-4.115-2.65-6.604-2.65-5.514 0-10 4.486-10 10s4.486 10 10 10c5.772 0 9.6-4.057 9.6-9.773 0-0.727-0.094-1.436-0.238-2.109h-9.362z"
                  fill="#4285F4"
                />
                <path
                  d="M12.545 10.239v3.821h5.445c-0.243 0.767-0.636 1.451-1.146 2.019h0.001l3.419 2.646c-1.994 1.85-4.585 2.981-7.719 2.981-5.514 0-10-4.486-10-10s4.486-10 10-10c2.489 0 4.831 1.001 6.604 2.65l-2.778 2.778c-1.034-0.877-2.362-1.409-3.826-1.409-3.314 0-6 2.686-6 6s2.686 6 6 6c3.046 0 4.802-1.428 5.445-3.458h-5.445v-3.821h9.362c0.144 0.673 0.238 1.382 0.238 2.109 0 5.716-3.828 9.773-9.6 9.773z"
                  fill="#34A853"
                />
                <path
                  d="M6.545 14.518v-3.821h-5.435c0.143-0.672 0.237-1.381 0.237-2.108 0-5.715 3.828-9.772 9.599-9.772v3.821c-3.046 0-4.801 1.428-5.444 3.458h5.444v3.821h-5.444c0.643-2.03 2.398-3.458 5.444-3.458v3.821c-3.045 0-4.801-1.428-5.444-3.458h-3.55v3.821h9.599c0.144 0.672 0.238 1.381 0.238 2.108 0 5.715-3.828 9.772-9.599 9.772v-3.821c3.045 0 4.801-1.428 5.444-3.458h-5.444z"
                  fill="#FBBC05"
                />
                <path
                  d="M17.1 11.181c0.826 2.593 0.487 4.736-0.911 6.368l-3.419-2.646c0.51-0.568 0.903-1.252 1.146-2.019h-5.445v-3.822h8.629z"
                  fill="#EA4335"
                />
              </svg>
              Google로 로그인
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

```

# app/auth/signup/page.tsx

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage('가입 확인 이메일을 확인해주세요.');
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Google 회원가입 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">회원가입</h1>
          <p className="mt-2 text-gray-600">
            언어 학습 웹 서비스 계정을 만들어보세요.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="6자 이상의 비밀번호"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="비밀번호 재입력"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.643 2.03-2.399 3.458-5.445 3.458-3.314 0-6-2.686-6-6s2.686-6 6-6c1.464 0 2.792 0.532 3.826 1.409l2.778-2.778c-1.773-1.649-4.115-2.65-6.604-2.65-5.514 0-10 4.486-10 10s4.486 10 10 10c5.772 0 9.6-4.057 9.6-9.773 0-0.727-0.094-1.436-0.238-2.109h-9.362z"
                  fill="#4285F4"
                />
                <path
                  d="M12.545 10.239v3.821h5.445c-0.243 0.767-0.636 1.451-1.146 2.019h0.001l3.419 2.646c-1.994 1.85-4.585 2.981-7.719 2.981-5.514 0-10-4.486-10-10s4.486-10 10-10c2.489 0 4.831 1.001 6.604 2.65l-2.778 2.778c-1.034-0.877-2.362-1.409-3.826-1.409-3.314 0-6 2.686-6 6s2.686 6 6 6c3.046 0 4.802-1.428 5.445-3.458h-5.445v-3.821h9.362c0.144 0.673 0.238 1.382 0.238 2.109 0 5.716-3.828 9.773-9.6 9.773z"
                  fill="#34A853"
                />
                <path
                  d="M6.545 14.518v-3.821h-5.435c0.143-0.672 0.237-1.381 0.237-2.108 0-5.715 3.828-9.772 9.599-9.772v3.821c-3.046 0-4.801 1.428-5.444 3.458h5.444v3.821h-5.444c0.643-2.03 2.398-3.458 5.444-3.458v3.821c-3.045 0-4.801-1.428-5.444-3.458h-3.55v3.821h9.599c0.144 0.672 0.238 1.381 0.238 2.108 0 5.715-3.828 9.772-9.599 9.772v-3.821c3.045 0 4.801-1.428 5.444-3.458h-5.444z"
                  fill="#FBBC05"
                />
                <path
                  d="M17.1 11.181c0.826 2.593 0.487 4.736-0.911 6.368l-3.419-2.646c0.51-0.568 0.903-1.252 1.146-2.019h-5.445v-3.822h8.629z"
                  fill="#EA4335"
                />
              </svg>
              Google로 회원가입
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/folders/[categoryId]/[subcategoryId]/page.tsx

```tsx
import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Flashcard } from '@/types/card';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

// 클라이언트 컴포넌트를 동적으로 임포트
const FlashcardList = dynamic(() => import('@/components/folders/FlashcardList'));

interface FlashcardPageProps {
  params: {
    categoryId: string;
    subcategoryId: string;
  };
}

// 메타데이터 생성 함수
export async function generateMetadata({ params }: FlashcardPageProps) {
  const { categoryId, subcategoryId } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single();
  
  const { data: subcategory } = await supabase
    .from('subcategories')
    .select('name')
    .eq('id', subcategoryId)
    .single();
  
  const categoryName = category?.name || '폴더';
  const subcategoryName = subcategory?.name || '하위 폴더';
  
  return {
    title: `${subcategoryName} - 플래시카드`,
    description: `${categoryName} > ${subcategoryName} 안의 플래시카드를 관리하세요`,
  };
}

// 클라이언트와 서버에서 각각 사용할 데이터 가져오기 함수
async function getCategoryServer(categoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCategoryServer:', error);
    return null;
  }
}

async function getSubcategoryServer(subcategoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', subcategoryId)
      .single();
    
    if (error) {
      console.error('Error fetching subcategory:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSubcategoryServer:', error);
    return null;
  }
}

async function getFlashcardsServer(subcategoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching flashcards:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFlashcardsServer:', error);
    return [];
  }
}

// 서버 액션 추가 - 플래시카드 목록을 새로고침
export async function refreshFlashcards(subcategoryId: string) {
  'use server';
  const flashcards = await getFlashcardsServer(subcategoryId);
  revalidatePath(`/folders/[categoryId]/${subcategoryId}`);
  return flashcards;
}

export default async function FlashcardPage({ params }: FlashcardPageProps) {
  const { categoryId, subcategoryId } = params;
  const category = await getCategoryServer(categoryId);
  const subcategory = await getSubcategoryServer(subcategoryId);
  const flashcards = await getFlashcardsServer(subcategoryId);
  
  if (!category || !subcategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">폴더를 찾을 수 없습니다</h1>
        <p className="mb-4">요청하신 폴더를 찾을 수 없습니다.</p>
        <Link href="/folders" className="text-primary hover:underline">
          폴더 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/folders" className="text-gray-500 hover:text-primary">
            폴더 목록
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href={`/folders/${categoryId}`} className="text-gray-500 hover:text-primary">
            {category.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700 font-medium">{subcategory.name}</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {subcategory.name} <span className="text-gray-500 font-normal">안의 플래시카드</span>
      </h1>
      
      {subcategory.description && (
        <p className="text-gray-600 mb-6">{subcategory.description}</p>
      )}
      
      <div className="mb-8">
        <FlashcardList
          flashcards={flashcards as Flashcard[]}
          subcategoryId={subcategoryId}
          refreshAction={refreshFlashcards}
        />
      </div>
      
      <div className="mt-8">
        <Link
          href={`/learn/stage1?subcategoryId=${subcategoryId}`}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
        >
          영작 연습하기
        </Link>
      </div>
    </div>
  );
}
```

# app/folders/[categoryId]/page.tsx

```tsx
import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Category, Subcategory } from '@/types/card';
import Link from 'next/link';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

// 클라이언트 컴포넌트를 동적으로 임포트
const FolderList = dynamic(() => import('@/components/folders/FolderList'));

interface SubcategoryPageProps {
  params: {
    categoryId: string;
  };
}

// 메타데이터 생성 함수
export async function generateMetadata({ params }: SubcategoryPageProps) {
  const categoryId = params.categoryId;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single();
  
  const categoryName = data?.name || '폴더';
  
  return {
    title: `${categoryName} - 중분류 폴더`,
    description: `${categoryName} 안의 중분류 폴더를 관리하세요`,
  };
}

// 클라이언트와 서버에서 각각 사용할 데이터 가져오기 함수
async function getCategoryServer(categoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCategoryServer:', error);
    return null;
  }
}

async function getSubcategoriesServer(categoryId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSubcategoriesServer:', error);
    return [];
  }
}

// 서버 액션 추가 - 중분류 폴더(서브카테고리) 목록을 새로고침
export async function refreshSubcategories(categoryId: string) {
  'use server';
  const subcategories = await getSubcategoriesServer(categoryId);
  revalidatePath(`/folders/${categoryId}`);
  return subcategories;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const categoryId = params.categoryId;
  const category = await getCategoryServer(categoryId);
  const subcategories = await getSubcategoriesServer(categoryId);
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">폴더를 찾을 수 없습니다</h1>
        <p className="mb-4">요청하신 폴더를 찾을 수 없습니다.</p>
        <Link href="/folders" className="text-primary hover:underline">
          폴더 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/folders" className="text-primary hover:underline flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          폴더 목록으로 돌아가기
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {category.name} <span className="text-gray-500 font-normal">안의 중분류 폴더</span>
      </h1>
      
      {category.description && (
        <p className="text-gray-600 mb-6">{category.description}</p>
      )}
      
      <div className="mb-8">
        <FolderList
          folders={subcategories as Subcategory[]}
          type="subcategory"
          categoryId={categoryId}
          refreshAction={refreshSubcategories}
          emptyMessage="이 폴더에는 중분류 폴더가 없습니다. 새 폴더를 만들어보세요."
        />
      </div>
    </div>
  );
}
```

# app/folders/page.tsx

```tsx
import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Category, Subcategory } from '@/types/card';
import { Database } from '@/types/supabase';

// 클라이언트 컴포넌트를 동적으로 임포트
const FolderList = dynamic(() => import('@/components/folders/FolderList'));

export const metadata = {
  title: '폴더 관리 - 언어 학습',
  description: '학습 폴더를 관리하세요',
};

// 서버 액션 정의
async function refreshCategories(): Promise<(Category | Subcategory)[]> {
  'use server';
  // 서버에서 최신 데이터 가져오기
  const data = await getCategoriesServer();
  return data as (Category | Subcategory)[];
}

// 클라이언트와 서버에서 각각 사용할 데이터 가져오기 함수
async function getCategoriesServer() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategoriesServer:', error);
    return [];
  }
}

export default async function FoldersPage() {
  const categories = await getCategoriesServer();

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>폴더 관리</h1>

      <div className='mb-8'>
        <FolderList
          folders={categories as Category[]}
          type='category'
          refreshAction={refreshCategories}
        />
      </div>
    </div>
  );
}

```

# app/globals.css

```css
@import 'tailwindcss';

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 7%;
  --card: 0 0% 98%;
  --card-foreground: 0 0% 7%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 98%;
  --secondary: 210 20% 96%;
  --secondary-foreground: 0 0% 7%;
  --accent: 210 20% 96%;
  --accent-foreground: 0 0% 7%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89%;
  --input: 0 0% 89%;
  --ring: 221 83% 53%;
}

.dark {
  --background: 0 0% 7%;
  --foreground: 0 0% 95%;
  --card: 0 0% 11%;
  --card-foreground: 0 0% 98%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 15%;
  --secondary-foreground: 0 0% 95%;
  --accent: 0 0% 20%;
  --accent-foreground: 0 0% 98%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 70%;
  --destructive: 0 100% 50%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 20%;
  --input: 0 0% 20%;
  --ring: 221 83% 53%;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: Arial, Helvetica, sans-serif;
}
/* 링크 요소의 대비를 개선하는 스타일 */
a {
  color: hsl(var(--primary));
  transition: opacity 0.2s ease;
}

a:hover {
  opacity: 0.8;
}

/* 카드 요소의 배경과 텍스트 대비 개선 */
.bg-white {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
}

/* 버튼 요소의 대비 개선 */
.bg-blue-500 {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.bg-blue-600 {
  background-color: hsl(221 90% 45%);
  color: hsl(var(--primary-foreground));
}

.bg-blue-50 {
  background-color: hsl(221 30% 20%);
  color: hsl(var(--foreground));
}

/* 텍스트 색상 대비 개선 */
.text-gray-600 {
  color: hsl(0 0% 45%);
}

.dark .text-gray-600 {
  color: hsl(0 0% 80%);
}

.text-gray-700 {
  color: hsl(0 0% 35%);
}

.dark .text-gray-700 {
  color: hsl(0 0% 85%);
}

```

# app/layout.tsx

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Language Master - 효율적인 언어 학습',
  description:
    '효율적인 언어 학습을 위한 4단계 시스템: 영작 연습, 플래시 카드, 컨텍스트 학습, 말하기 연습',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className='flex flex-col min-h-screen'>
            <Header />
            <main className='flex-1'>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

```

# app/learn/layout.tsx

```tsx
import React from 'react';
import Link from 'next/link';

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen flex flex-col'>
      <header className='bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] p-4 shadow-md'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>
            언어 학습 웹 서비스
          </Link>
          <nav className='space-x-4'>
            <Link href='/learn' className='hover:underline'>
              학습 메인
            </Link>
          </nav>
        </div>
      </header>

      <main className='flex-grow container mx-auto p-4 md:p-6 max-w-5xl'>
        {children}
      </main>

      <footer className='bg-[hsl(var(--secondary))] p-4 text-center text-[hsl(var(--secondary-foreground))] text-sm border-t border-[hsl(var(--border))]'>
        <div className='container mx-auto'>
          <p>© 2024 언어 학습 웹 서비스. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

```

# app/learn/page.tsx

```tsx
'use client';

import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className='text-[hsl(var(--foreground))]'>
      <h1 className='text-3xl font-bold mb-6'>언어 학습</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-8'>
        <Link
          href='/learn/stage1'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            1단계: CSV 문장 입력 및 영작 연습
          </h2>
          <p className='text-gray-600'>
            모국어 문장을 보고 학습 언어로 작성하는 연습을 통해 기본 문장
            구성력을 키웁니다.
          </p>
        </Link>

        <Link
          href='/learn/stage2'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>2단계: 플래시 카드 학습</h2>
          <p className='text-gray-600'>
            카드 형태의 학습을 통해 문장을 익히고, 음성으로 정확한 발음을
            들어봅니다.
          </p>
        </Link>

        <Link
          href='/learn/stage3'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            3단계: 문맥 이해를 위한 Podcast
          </h2>
          <p className='text-gray-600'>
            문장이 사용되는 상황과 맥락을 이해하고, 자연스러운 표현을 배웁니다.
          </p>
        </Link>

        <Link
          href='/learn/stage4'
          className='block p-6 bg-[hsl(var(--card))] shadow-md rounded-lg hover:shadow-lg transition-shadow border border-[hsl(var(--border))]'
        >
          <h2 className='text-xl font-bold mb-2'>
            4단계: 음성인식 말하기 연습
          </h2>
          <p className='text-gray-600'>
            음성 인식 기술을 활용해 직접 말하기를 연습하고 피드백을 받습니다.
          </p>
        </Link>
      </div>

      <div className='p-6 bg-[hsl(var(--secondary))] rounded-lg border border-[hsl(var(--border))]'>
        <h2 className='text-lg font-bold mb-2'>시작하기</h2>
        <p className='text-gray-700'>
          언어 학습을 시작하려면 1단계에서 CSV 형식의 학습 문장을 입력하세요.
          모든 단계는 순차적으로 진행하는 것이 가장 효과적입니다.
        </p>
      </div>
    </div>
  );
}

```

# app/learn/stage1/page.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/types/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import CsvImport from '@/components/learn/CsvImport';
import Stage1Exercise from '@/components/learn/Stage1Exercise';
import Button from '@/components/ui/Button';

export default function Stage1Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategoryId = searchParams.get('subcategoryId');

  // Supabase 또는 로컬 스토리지에서 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    
    const loadCards = async () => {
      // subcategoryId가 있으면 Supabase에서 데이터 불러오기
      if (subcategoryId) {
        try {
          const supabase = createClientComponentClient<Database>();
          const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('created_at', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Supabase 데이터 형식을 Card 형식으로 변환
            const formattedCards: Card[] = data.map((item) => ({
              id: item.id,
              native: item.native_text, // 모국어(한국어)
              target: item.foreign_text, // 학습 언어(영어)
              status: 'unseen',
            }));
            
            setCards(formattedCards);
            // 로컬 스토리지에도 저장하여 다음 단계에서 사용할 수 있도록 함
            localStorage.setItem('learningCards', JSON.stringify(formattedCards));
            setIsLoading(false);
            // URL에서 subcategoryId가 있으면 바로 연습 시작
            setExerciseStarted(true);
            return;
          }
        } catch (error) {
          console.error('Supabase에서 카드 불러오기 실패:', error);
        }
      }
      
      // subcategoryId가 없거나 Supabase 로드 실패 시 로컬 스토리지에서 시도
      try {
        const savedCards = localStorage.getItem('learningCards');
        if (savedCards) {
          setCards(JSON.parse(savedCards));
        }
      } catch (error) {
        console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
      }
      
      setIsLoading(false);
    };
    
    loadCards();
  }, [subcategoryId]);

  // 카드 데이터 저장
  const handleCardsLoaded = (newCards: Card[]) => {
    setCards(newCards);
    try {
      localStorage.setItem('learningCards', JSON.stringify(newCards));
    } catch (error) {
      console.error('로컬 스토리지에 카드 저장 실패:', error);
    }
    setExerciseStarted(false);
  };

  // 영작 연습 시작
  const handleStartExercise = () => {
    setExerciseStarted(true);
  };

  // 영작 연습 완료
  const handleExerciseComplete = () => {
    alert('영작 연습을 완료했습니다! 다음 단계로 이동합니다.');
    router.push('/learn/stage2');
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>
        1단계: CSV 문장 입력 및 영작 연습
      </h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {!exerciseStarted ? (
            <div className='space-y-8'>
              <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
                <h2 className='text-xl font-semibold mb-4'>
                  1. CSV 파일 업로드
                </h2>
                <p className='mb-4'>
                  학습할 문장이 담긴 CSV 파일을 업로드하세요. 각 행은
                  &ldquo;영어 문장&rdquo;, &ldquo;한국어 번역&rdquo; 형식이어야
                  합니다.
                </p>
                <CsvImport onCardsLoaded={handleCardsLoaded} />
              </div>

              {cards.length > 0 && (
                <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
                  <h2 className='text-xl font-semibold mb-4'>
                    2. 영작 연습 시작
                  </h2>
                  <p className='mb-4'>
                    {cards.length}개의 문장이 준비되었습니다. 영작 연습을
                    시작하시겠습니까?
                  </p>
                  <Button onClick={handleStartExercise} variant='secondary'>
                    영작 연습 시작
                  </Button>
                </div>
              )}

              <div className='flex justify-between mt-8'>
                <Button onClick={handleGoBack} variant='outline'>
                  이전으로
                </Button>
              </div>
            </div>
          ) : (
            <Stage1Exercise
              cards={cards}
              onComplete={handleExerciseComplete}
              className='mt-4'
            />
          )}
        </>
      )}
    </div>
  );
}

```

# app/learn/stage2/page.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/types/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Stage2Flashcards from '@/components/learn/Stage2Flashcards';
import Button from '@/components/ui/Button';

export default function Stage2Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategoryId = searchParams.get('subcategoryId');

  // Supabase 또는 로컬 스토리지에서 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    
    const loadCards = async () => {
      // subcategoryId가 있으면 Supabase에서 데이터 불러오기
      if (subcategoryId) {
        try {
          const supabase = createClientComponentClient<Database>();
          const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('created_at', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Supabase 데이터 형식을 Card 형식으로 변환
            const formattedCards: Card[] = data.map((item) => ({
              id: item.id,
              native: item.native_text, // 모국어(한국어)
              target: item.foreign_text, // 학습 언어(영어)
              status: 'unseen',
            }));
            
            setCards(formattedCards);
            // 로컬 스토리지에도 저장하여 다음 단계에서 사용할 수 있도록 함
            localStorage.setItem('learningCards', JSON.stringify(formattedCards));
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Supabase에서 카드 불러오기 실패:', error);
        }
      }
      
      // subcategoryId가 없거나 Supabase 로드 실패 시 로컬 스토리지에서 시도
      try {
        const savedCards = localStorage.getItem('learningCards');
        if (savedCards) {
          setCards(JSON.parse(savedCards));
        }
      } catch (error) {
        console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
      }
      
      setIsLoading(false);
    };
    
    loadCards();
  }, [subcategoryId]);

  const handleFlashcardsComplete = () => {
    alert('플래시 카드 학습을 완료했습니다! 다음 단계로 이동합니다.');
    router.push('/learn/stage3');
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn/stage1');
  };

  // 카드가 없는 경우의 처리
  const handleGoToStage1 = () => {
    router.push('/learn/stage1');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>2단계: 플래시 카드 학습</h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))] mb-6'>
                <h2 className='text-xl font-semibold mb-4'>플래시 카드 학습</h2>
                <p className='mb-4'>
                  카드를 클릭하여 앞면/뒷면을 전환할 수 있습니다. 카드의 앞면은
                  한국어, 뒷면은 영어입니다. 카드를 학습한 후 '다시 보기' 또는
                  '알고 있음' 버튼을 선택하여 학습 상태를 기록하세요.
                </p>

                <Stage2Flashcards
                  cards={cards}
                  onComplete={handleFlashcardsComplete}
                  className='mt-6'
                />
              </div>

              <div className='flex justify-between mt-4'>
                <Button onClick={handleGoBack} variant='outline'>
                  이전 단계로
                </Button>
              </div>
            </>
          ) : (
            <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
              <h2 className='text-xl font-semibold mb-4'>
                카드를 먼저 등록해주세요
              </h2>
              <p className='mb-4'>
                플래시 카드 학습을 시작하기 전에 1단계에서 학습할 문장을
                등록해주세요.
              </p>
              <Button onClick={handleGoToStage1} variant='secondary'>
                1단계로 이동
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

```

# app/learn/stage3/page.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/types/card';
import Stage3Podcast from '@/components/learn/Stage3Podcast';
import Button from '@/components/ui/Button';

export default function Stage3Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 로컬 스토리지에서 저장된 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCards = localStorage.getItem('learningCards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    } catch (error) {
      console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
    }
    setIsLoading(false);
  }, []);

  const handlePodcastComplete = () => {
    alert('Podcast 학습을 완료했습니다! 다음 단계로 이동합니다.');
    router.push('/learn/stage4');
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn/stage2');
  };

  // 카드가 없는 경우의 처리
  const handleGoToStage1 = () => {
    router.push('/learn/stage1');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>
        3단계: 문맥 이해를 위한 Podcast
      </h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))] mb-6'>
                <h2 className='text-xl font-semibold mb-4'>Podcast 학습</h2>
                <p className='mb-4'>
                  이전 단계에서 학습한 문장들을 문맥과 함께 자연스럽게 듣고
                  이해할 수 있습니다. 문장을 듣고 번역을 확인하며 학습하세요.
                </p>

                <Stage3Podcast
                  cards={cards}
                  onComplete={handlePodcastComplete}
                  className='mt-6'
                />
              </div>

              <div className='flex justify-between mt-4'>
                <Button onClick={handleGoBack} variant='outline'>
                  이전 단계로
                </Button>
              </div>
            </>
          ) : (
            <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
              <h2 className='text-xl font-semibold mb-4'>
                카드를 먼저 등록해주세요
              </h2>
              <p className='mb-4'>
                Podcast 학습을 시작하기 전에 1단계에서 학습할 문장을
                등록해주세요.
              </p>
              <Button onClick={handleGoToStage1} variant='secondary'>
                1단계로 이동
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

```

# app/learn/stage4/page.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/types/card';
import Stage4Speaking from '@/components/learn/Stage4Speaking';
import Button from '@/components/ui/Button';

export default function Stage4Page() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  // 로컬 스토리지에서 저장된 카드 데이터 불러오기
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCards = localStorage.getItem('learningCards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }

      // 학습 완료 상태도 확인
      const completedStatus = localStorage.getItem('stage4Completed');
      if (completedStatus === 'true') {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('로컬 스토리지에서 카드 불러오기 실패:', error);
    }
    setIsLoading(false);
  }, []);

  const handleSpeakingComplete = () => {
    // 완료 상태를 로컬 스토리지에 저장
    try {
      localStorage.setItem('stage4Completed', 'true');
      setIsCompleted(true);
    } catch (error) {
      console.error('학습 완료 상태 저장 실패:', error);
    }
  };

  // 다시 시작 - 진행 상태 초기화
  const handleRestart = () => {
    try {
      localStorage.removeItem('stage4Progress');
      localStorage.removeItem('stage4Completed');
      setIsCompleted(false);
      window.location.reload(); // 페이지 새로고침
    } catch (error) {
      console.error('진행 상태 초기화 실패:', error);
    }
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    router.push('/learn/stage3');
  };

  // 학습 메인으로 이동
  const handleGoToLearn = () => {
    router.push('/learn');
  };

  // 카드가 없는 경우의 처리
  const handleGoToStage1 = () => {
    router.push('/learn/stage1');
  };

  // 학습 완료 결과 화면
  const CompletionResult = () => (
    <div className='bg-[hsl(var(--card))] p-8 rounded-lg shadow-md border border-[hsl(var(--border))]'>
      <div className='text-center'>
        <svg
          className='w-16 h-16 mx-auto text-green-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <h2 className='text-2xl font-bold mt-4 mb-2'>축하합니다!</h2>
        <p className='text-lg mb-6'>
          4단계 음성인식 말하기 연습을 완료했습니다.
        </p>
      </div>

      <div className='mb-8'>
        <h3 className='text-xl font-semibold mb-3'>학습 결과</h3>
        <p className='mb-4'>
          이제 문장을 보고 즉각적으로 영어로 말할 수 있는 능력이 향상되었습니다.
          음성 인식을 통해 본인의 발음과 문장 구성 능력도 확인했습니다.
        </p>
        <p className='mb-4'>
          학습한 내용을 정기적으로 복습하고, 실생활에서 활용해보세요.
        </p>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <Button onClick={handleRestart} variant='outline'>
          다시 학습하기
        </Button>
        <Button onClick={handleGoToLearn} variant='secondary'>
          학습 메뉴로
        </Button>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto p-6 text-[hsl(var(--foreground))]'>
      <h1 className='text-2xl font-bold mb-4'>4단계: 음성인식 말하기 연습</h1>

      {isLoading ? (
        <p className='text-gray-600'>로딩 중...</p>
      ) : (
        <>
          {cards.length > 0 ? (
            <>
              {isCompleted ? (
                <CompletionResult />
              ) : (
                <>
                  <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))] mb-6'>
                    <h2 className='text-xl font-semibold mb-4'>말하기 연습</h2>
                    <p className='mb-4'>
                      한국어 문장을 보고 영어로 말해보세요. 음성 인식을 통해
                      발음과 문장 구성이 정확한지 확인합니다. 마이크 버튼을
                      클릭하여 말하기를 시작하세요.
                    </p>
                    <p className='mb-4 text-sm text-gray-600'>
                      각 문장은 정확히 말하거나, 3번 이상 시도하면 완료로
                      처리됩니다. 음성 인식이 잘 되지 않으면 더 크고 명확하게
                      발음하세요.
                    </p>

                    <Stage4Speaking
                      cards={cards}
                      onComplete={handleSpeakingComplete}
                      className='mt-6'
                    />
                  </div>

                  <div className='flex justify-between mt-4'>
                    <Button onClick={handleGoBack} variant='outline'>
                      이전 단계로
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className='bg-[hsl(var(--card))] p-6 rounded-lg shadow-md border border-[hsl(var(--border))]'>
              <h2 className='text-xl font-semibold mb-4'>
                카드를 먼저 등록해주세요
              </h2>
              <p className='mb-4'>
                말하기 연습을 시작하기 전에 1단계에서 학습할 문장을
                등록해주세요.
              </p>
              <Button onClick={handleGoToStage1} variant='secondary'>
                1단계로 이동
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

```

# app/page.tsx

```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className='min-h-screen p-8 flex flex-col items-center justify-center text-[hsl(var(--foreground))]'>
      <h1 className='text-4xl font-bold mb-8'>언어 학습 웹 서비스</h1>

      <div className='max-w-2xl text-center mb-12'>
        <p className='text-xl mb-4'>
          모국어와 학습할 외국어를 활용하여 효과적으로 언어를 학습하세요.
        </p>
        <p className='text-gray-600'>
          단계별 학습을 통해 체계적으로 외국어 실력을 향상시킬 수 있습니다.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl'>
        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>1단계: 영작 연습</h2>
          <p className='text-gray-600 mb-4'>
            모국어 문장을 보고 학습 언어로 작성하는 연습을 통해 기본 문장
            구성력을 키웁니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>2단계: 플래시 카드</h2>
          <p className='text-gray-600 mb-4'>
            카드 형태의 학습을 통해 문장을 익히고, 음성으로 정확한 발음을
            들어봅니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>3단계: 컨텍스트 학습</h2>
          <p className='text-gray-600 mb-4'>
            문장이 사용되는 상황과 맥락을 이해하고, 자연스러운 표현을 배웁니다.
          </p>
        </div>

        <div className='p-6 bg-[hsl(var(--card))] shadow-md rounded-lg border border-[hsl(var(--border))]'>
          <h2 className='text-xl font-bold mb-2'>4단계: 말하기 연습</h2>
          <p className='text-gray-600 mb-4'>
            음성 인식 기술을 활용해 직접 말하기를 연습하고 피드백을 받습니다.
          </p>
        </div>
      </div>

      <Link
        href='/learn'
        className='mt-12 px-8 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium rounded-md hover:bg-opacity-90 transition-all hover:shadow-lg'
      >
        학습 시작하기
      </Link>
    </main>
  );
}

```

# components/auth/AuthGuard.tsx

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      if (!user) {
        router.push('/auth/login');
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/auth/login');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return fallback || null;
  }
  
  return <>{children}</>;
}

```

# components/auth/LogoutButton.tsx

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${className}`}
    >
      로그아웃
    </button>
  );
}

```

# components/auth/UserProfile.tsx

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex gap-2 items-center">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-4 items-center">
        <Link 
          href="/auth/login" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          로그인
        </Link>
        <Link 
          href="/auth/signup" 
          className="text-sm font-medium px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Profile" 
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
      </div>
      <LogoutButton />
    </div>
  );
}

```

# components/common/ErrorMessage.tsx

```tsx
'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/cn';

// 오류 메시지 스타일 변형 정의
const errorMessageVariants = cva(
  // 기본 스타일
  'flex items-start p-3 rounded-md text-sm',
  {
    variants: {
      // 메시지 유형
      variant: {
        error:
          'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border border-[hsl(var(--destructive))]/20',
        warning:
          'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/20',
        info: 'bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border border-[hsl(var(--info))]/20',
        success:
          'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20',
      },
      // 크기 변형
      size: {
        default: 'text-sm',
        sm: 'text-xs p-2',
        lg: 'text-base p-4',
      },
    },
    defaultVariants: {
      variant: 'error',
      size: 'default',
    },
  }
);

// 오류 메시지 아이콘 스타일
const iconVariants = cva('mr-2 shrink-0', {
  variants: {
    size: {
      default: 'w-5 h-5',
      sm: 'w-4 h-4',
      lg: 'w-6 h-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

// ErrorMessage Props 타입 정의
export interface ErrorMessageProps
  extends VariantProps<typeof errorMessageVariants> {
  message: string;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * 재사용 가능한 오류/알림 메시지 컴포넌트
 * 다양한 상태(오류, 경고, 정보, 성공)를 지원합니다.
 */
export function ErrorMessage({
  message,
  variant = 'error',
  size = 'default',
  className,
  icon,
  title,
  dismissible = false,
  onDismiss,
}: ErrorMessageProps) {
  // 기본 아이콘 생성 함수
  const getDefaultIcon = () => {
    switch (variant) {
      case 'error':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={cn(iconVariants({ size }))}
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='12' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
        );
      case 'warning':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={cn(iconVariants({ size }))}
          >
            <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
            <line x1='12' y1='9' x2='12' y2='13' />
            <line x1='12' y1='17' x2='12.01' y2='17' />
          </svg>
        );
      case 'info':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={cn(iconVariants({ size }))}
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='16' x2='12' y2='12' />
            <line x1='12' y1='8' x2='12.01' y2='8' />
          </svg>
        );
      case 'success':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={cn(iconVariants({ size }))}
          >
            <path d='M22 11.08V12a10 10 0 11-5.93-9.14' />
            <polyline points='22 4 12 14.01 9 11.01' />
          </svg>
        );
      default:
        return null;
    }
  };

  // 닫기 아이콘
  const closeIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='w-4 h-4 cursor-pointer opacity-70 hover:opacity-100'
      onClick={onDismiss}
    >
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
  );

  return (
    <div className={cn(errorMessageVariants({ variant, size }), className)}>
      {(icon || getDefaultIcon()) && (icon || getDefaultIcon())}
      <div className='flex-1'>
        {title && <div className='font-medium mb-1'>{title}</div>}
        <div>{message}</div>
      </div>
      {dismissible && onDismiss && <div className='ml-2'>{closeIcon}</div>}
    </div>
  );
}

export { errorMessageVariants };
export default ErrorMessage;

```

# components/folders/CreateFolderButton.tsx

```tsx
'use client';

import React, { useState } from 'react';
import FolderForm from './FolderForm';

interface CreateFolderButtonProps {
  type: 'category' | 'subcategory';
  categoryId?: string;
  onSuccess?: () => void;
  buttonText?: string;
}

export default function CreateFolderButton({ 
  type, 
  categoryId, 
  onSuccess,
  buttonText = '새 폴더 만들기'
}: CreateFolderButtonProps) {
  const [showForm, setShowForm] = useState(false);

  const handleButtonClick = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (onSuccess) {
      onSuccess();
    } else {
      // 폴더 목록을 갱신하기 위해 페이지 새로고침
      window.location.reload();
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      {!showForm ? (
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark"
        >
          {buttonText}
        </button>
      ) : (
        <FolderForm
          type={type}
          categoryId={categoryId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

```

# components/folders/FlashcardList.tsx

```tsx
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
```

# components/folders/FolderForm.tsx

```tsx
'use client';

import React, { useState } from 'react';
import { Category, Subcategory } from '@/types/card';
import { createCategory, updateCategory, createSubcategory, updateSubcategory } from '@/lib/supabase/api';

interface FolderFormProps {
  type: 'category' | 'subcategory';
  folder?: Category | Subcategory;
  categoryId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FolderForm({ type, folder, categoryId, onSuccess, onCancel }: FolderFormProps) {
  const isEditing = !!folder;
  const isCategory = type === 'category';
  const title = isEditing ? '폴더 수정' : '새 폴더 만들기';
  
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('폴더 이름을 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isCategory) {
        if (isEditing && folder) {
          // 카테고리 수정
          await updateCategory(folder.id, { name, description });
        } else {
          // 새 카테고리 생성
          await createCategory({ name, description });
        }
      } else {
        // 서브카테고리 작업
        const subcategoryParentId = isEditing 
          ? (folder as Subcategory).category_id 
          : categoryId;
          
        if (!subcategoryParentId) {
          throw new Error('카테고리 ID가 필요합니다.');
        }
        
        if (isEditing && folder) {
          // 서브카테고리 수정
          await updateSubcategory(folder.id, { name, description });
        } else {
          // 새 서브카테고리 생성
          await createSubcategory({ 
            name, 
            description, 
            category_id: subcategoryParentId 
          });
        }
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || '폴더를 저장하는 도중 오류가 발생했습니다.');
      console.error('Error saving folder:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            폴더 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="폴더 이름을 입력하세요"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택사항)
          </label>
          <textarea
            id="description"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="폴더에 대한 설명을 입력하세요"
            rows={3}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : isEditing ? '저장' : '만들기'}
          </button>
        </div>
      </form>
    </div>
  );
}

```

# components/folders/FolderItem.tsx

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category, Subcategory } from '@/types/card';
import { deleteCategory, deleteSubcategory } from '@/lib/supabase/api';

interface FolderItemProps {
  folder: Category | Subcategory;
  type: 'category' | 'subcategory';
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function FolderItem({ folder, type, onDelete, onEdit }: FolderItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCategory = type === 'category';
  const folderLink = isCategory 
    ? `/folders/${folder.id}` 
    : `/folders/${(folder as Subcategory).category_id}/${folder.id}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`정말로 ${folder.name} 폴더를 삭제하시겠습니까?`)) {
      try {
        setIsDeleting(true);
        setError(null);

        if (isCategory) {
          await deleteCategory(folder.id);
        } else {
          await deleteSubcategory(folder.id);
        }

        if (onDelete) {
          onDelete();
        }
      } catch (err: any) {
        setError(err.message || '폴더를 삭제하는 도중 오류가 발생했습니다.');
        console.error('Error deleting folder:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div className="relative group">
      <Link href={folderLink} className="block">
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
          {/* 폴더 아이콘 */}
          <div className="text-blue-600">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
          
          {/* 폴더 정보 */}
          <div className="flex-1">
            <h3 className="font-medium">{folder.name}</h3>
            {folder.description && (
              <p className="text-gray-500 text-sm">{folder.description}</p>
            )}
          </div>
          
          {/* 폴더 메타데이터 */}
          <div className="text-sm text-gray-500">
            {new Date(folder.created_at).toISOString().split('T')[0].replace(/-/g, '/')}
          </div>
        </div>
      </Link>

      {/* 액션 버튼 */}
      <div className="absolute top-2 right-2 hidden group-hover:flex space-x-1">
        <button
          onClick={handleEdit}
          className="p-1 text-gray-500 hover:text-gray-700 bg-white rounded"
          title="편집"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1 text-red-500 hover:text-red-700 bg-white rounded"
          title="삭제"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mt-2 p-2 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}

```

# components/folders/FolderList.tsx

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Category, Subcategory } from '@/types/card';
import FolderItem from './FolderItem';
import FolderForm from './FolderForm';

interface FolderListProps {
  folders: (Category | Subcategory)[];
  type: 'category' | 'subcategory';
  categoryId?: string;
  refreshAction?: (id?: string) => Promise<(Category | Subcategory)[]>;
  emptyMessage?: string;
}

export default function FolderList({ 
  folders: initialFolders, 
  type, 
  categoryId,
  refreshAction,
  emptyMessage = '폴더가 없습니다. 새 폴더를 만들어보세요.'
}: FolderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Category | Subcategory | null>(null);
  const [folders, setFolders] = useState<(Category | Subcategory)[]>(initialFolders);

  // initialFolders가 변경되면 state 업데이트
  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  const handleAddClick = () => {
    setEditingFolder(null);
    setShowForm(true);
  };

  const handleEditClick = (folder: Category | Subcategory) => {
    setEditingFolder(folder);
    setShowForm(true);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingFolder(null);
    
    if (refreshAction) {
      try {
        // 서버 액션 호출하여 최신 데이터 가져오기
        const updatedFolders = await refreshAction(categoryId);
        // 데이터를 클라이언트 상태로 업데이트 (페이지 새로고침 없음)
        setFolders(updatedFolders);
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

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFolder(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {type === 'category' ? '대분류 폴더' : '중분류 폴더'}
        </h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          새 폴더 만들기
        </button>
      </div>

      {console.log('showForm:', showForm)}
      {showForm && (
        <FolderForm
          type={type}
          folder={editingFolder || undefined}
          categoryId={categoryId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {folders.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              type={type}
              onDelete={async () => {
                if (refreshAction) {
                  try {
                    const updatedFolders = await refreshAction(categoryId);
                    setFolders(updatedFolders);
                  } catch (error) {
                    console.error('새로고침 중 오류 발생:', error);
                    window.location.reload();
                  }
                } else {
                  window.location.reload();
                }
              }}
              onEdit={() => handleEditClick(folder)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

```

# components/layout/Footer.tsx

```tsx
'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full border-t border-border/40 bg-background py-8'>
      <div className='container px-4 md:px-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* 회사 정보 */}
          <div className='space-y-3'>
            <Link
              href='/'
              className='flex items-center gap-2 font-bold text-xl'
            >
              <span className='text-primary'>Language</span>
              <span>Master</span>
            </Link>
            <p className='text-sm text-muted-foreground max-w-xs'>
              효율적인 언어 학습을 위한 최적의 플랫폼. 영작 연습부터 음성 인식
              말하기 연습까지 모든 단계를 제공합니다.
            </p>
            <p className='text-sm text-muted-foreground'>
              &copy; {currentYear} Language Master. All rights reserved.
            </p>
          </div>

          {/* 사이트맵 */}
          <div className='space-y-3'>
            <h3 className='text-lg font-medium'>학습 단계</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/learn/stage1'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  영작 연습 (Stage 1)
                </Link>
              </li>
              <li>
                <Link
                  href='/learn/stage2'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  플래시 카드 (Stage 2)
                </Link>
              </li>
              <li>
                <Link
                  href='/learn/stage3'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  컨텍스트 학습 (Stage 3)
                </Link>
              </li>
              <li>
                <Link
                  href='/learn/stage4'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  말하기 연습 (Stage 4)
                </Link>
              </li>
            </ul>
          </div>

          {/* 더 많은 링크 */}
          <div className='space-y-3'>
            <h3 className='text-lg font-medium'>참고 자료</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/about'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link
                  href='/support'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  지원 및 도움말
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  개인정보 보호정책
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 소셜 미디어 아이콘 */}
        <div className='mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4'>
          <p className='text-xs text-muted-foreground'>
            효과적인 언어 학습을 위한 완벽한 솔루션
          </p>
          <div className='flex items-center space-x-4'>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label='Twitter'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
              </svg>
            </a>
            <a
              href='https://facebook.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label='Facebook'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
              </svg>
            </a>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label='Instagram'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
                <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

```

# components/layout/Header.tsx

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '../../lib/utils/cn';
import ThemeToggle from '@/components/ui/ThemeToggle';
import UserProfile from '@/components/auth/UserProfile';

/**
 * 상단 헤더 컴포넌트
 * 네비게이션 링크와 모바일 메뉴를 포함합니다.
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className='w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
        <Link href='/' className='flex items-center gap-2 font-bold text-xl'>
          <span className='text-primary'>Language</span>
          <span>Master</span>
        </Link>

        {/* 모바일 메뉴 버튼 */}
        <div className='flex items-center gap-2 md:hidden'>
          <ThemeToggle />
          <button
            className='flex items-center p-2'
            onClick={toggleMenu}
            aria-label='Toggle menu'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              {isMenuOpen ? (
                <path d='M18 6L6 18M6 6l12 12' />
              ) : (
                <path d='M4 12h16M4 6h16M4 18h16' />
              )}
            </svg>
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className='hidden md:flex items-center gap-6'>
          <nav className='flex gap-6'>
            {/* <Link
              href='/folders'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              폴더 관리
            </Link> */}
            {/* <Link
              href='/learn'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              학습하기
            </Link> */}
            <Link
              href='/folders'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              영작 연습
            </Link>
            <Link
              href='/learn/stage2'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              플래시 카드
            </Link>
            <Link
              href='/learn/stage3'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              컨텍스트 학습
            </Link>
            <Link
              href='/learn/stage4'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              말하기 연습
            </Link>
          </nav>
          <div className='flex items-center gap-4'>
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div
        className={cn(
          'md:hidden absolute w-full bg-background shadow-lg transition-transform duration-300 ease-in-out z-50',
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <nav className='flex flex-col px-4 py-4'>
          <Link
            href='/learn'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            학습하기
          </Link>
          <Link
            href='/folders'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            영작 연습
          </Link>
          <Link
            href='/learn/stage2'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            플래시 카드
          </Link>
          <Link
            href='/learn/stage3'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            컨텍스트 학습
          </Link>
          <Link
            href='/learn/stage4'
            className='py-3 text-sm font-medium transition-colors hover:text-primary'
            onClick={() => setIsMenuOpen(false)}
          >
            말하기 연습
          </Link>
          <div className='pt-3 border-t mt-3'>
            <UserProfile />
          </div>
        </nav>
      </div>
    </header>
  );
}

```

# components/learn/Card.tsx

```tsx
'use client';

import { useState } from 'react';
import { Card as CardType } from '@/types/card';

interface CardProps {
  card: CardType;
  showFront?: boolean;
  onFlip?: () => void;
  className?: string;
}

export function Card({
  card,
  showFront = true,
  onFlip,
  className = '',
}: CardProps) {
  const [isFlipped, setIsFlipped] = useState(!showFront);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto h-48 cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 카드 앞면 - 기본적으로 목표어(영어) */}
        <div
          className={`absolute w-full h-full bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-xl shadow-md p-6 flex items-center justify-center border border-[hsl(var(--border))]`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className='text-center'>
            <p className='text-xl font-medium'>{card.target}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-4'>
              클릭하여 뒤집기
            </p>
          </div>
        </div>

        {/* 카드 뒷면 - 모국어(한국어) */}
        <div
          className={`absolute w-full h-full bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-xl shadow-md p-6 flex items-center justify-center border border-[hsl(var(--border))]`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className='text-center'>
            <p className='text-xl font-medium'>{card.native}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-4'>
              클릭하여 뒤집기
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;

```

# components/learn/CardDeck.tsx

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/types/card';
import { Card } from './Card';
import Button from '@/components/ui/Button';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';

interface CardDeckProps {
  cards: CardType[];
  onCardStatusChange?: (cardId: number, newStatus: CardType['status']) => void;
  className?: string;
}

export function CardDeck({
  cards,
  onCardStatusChange,
  className = '',
}: CardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [shouldPlayNext, setShouldPlayNext] = useState(false);
  const { speak, isSpeaking, error } = useUnrealSpeech({
    apiKey:
      process.env.NEXT_PUBLIC_UNREALSPEECH_API_KEY ||
      process.env.UNREAL_SPEECH_API_KEY,
    voice: 'Jasper', // 남성 목소리: Jasper, Daniel, Oliver 등
    bitrate: '128k',
    speed: -0.2,
    pitch: 1.0,
  });

  // 현재 카드 정보 계산
  const currentCard = cards && cards.length > 0 ? cards[currentIndex] : null;
  const totalCards = cards ? cards.length : 0;

  // 이전 버튼 핸들러
  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setShouldPlayNext(true);
  }, []);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : prev));
    setShouldPlayNext(true);
  }, [totalCards]);

  // 카드 뒤집기 핸들러
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);

    // 카드가 앞면(영어)으로 뒤집을 때 자동으로 음성 재생
    if (isFlipped && autoPlayEnabled && currentCard) {
      speak(currentCard.target);
    }
  }, [isFlipped, autoPlayEnabled, currentCard, speak]);

  // 카드 상태 변경 핸들러
  const handleMarkStatus = useCallback(
    (status: CardType['status']) => {
      if (onCardStatusChange && currentCard) {
        onCardStatusChange(currentCard.id, status);
      }
      // 상태 변경 후 다음 카드로 이동
      handleNext();
    },
    [onCardStatusChange, currentCard, handleNext]
  );

  // 오디오 재생 핸들러
  const handlePlayAudio = useCallback(() => {
    if (currentCard) {
      speak(currentCard.target);
    }
  }, [currentCard, speak]);

  // 자동 재생 토글 핸들러
  const toggleAutoPlay = useCallback(() => {
    setAutoPlayEnabled((prev) => {
      const newState = !prev;
      if (newState) {
        // 자동 재생을 켜면 다음 카드에서부터 적용되도록 함
        setShouldPlayNext(false);
      }
      return newState;
    });
  }, []);

  // 카드가 변경되거나 플립될 때 자동 재생 처리
  useEffect(() => {
    // 자동 재생 로직에 오류 메시지가 있는지 확인
    // 오류가 있다면 자동 재생을 시도하지 않음
    if (error && error.includes('자동 재생')) {
      setShouldPlayNext(false);
      return;
    }

    if (
      shouldPlayNext &&
      autoPlayEnabled &&
      !isFlipped &&
      cards &&
      cards.length > 0 &&
      currentCard
    ) {
      // 경고: 이 부분은 브라우저 자동 재생 정책으로 인해 작동하지 않을 수 있음
      speak(currentCard.target).catch(() => {
        // 오류 발생 시 자동으로 처리됨 (useUnrealSpeech 내부에서)
        setShouldPlayNext(false);
      });
      setShouldPlayNext(false);
    }
  }, [
    currentIndex,
    isFlipped,
    shouldPlayNext,
    autoPlayEnabled,
    cards,
    currentCard,
    speak,
    error,
  ]);

  // 컴포넌트 마운트 시 첫 카드 자동 재생
  useEffect(() => {
    if (cards && cards.length > 0 && autoPlayEnabled) {
      setShouldPlayNext(true);
    }
  }, [cards, autoPlayEnabled]);

  // 카드가 없는 경우 처리
  if (!cards || cards.length === 0 || !currentCard) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          {currentIndex + 1} / {totalCards}
        </p>
      </div>

      <Card
        card={currentCard}
        showFront={!isFlipped}
        onFlip={handleFlip}
        className='mb-6'
      />

      <div className='text-center mb-4 flex justify-center gap-2'>
        <Button
          onClick={handlePlayAudio}
          variant='secondary'
          className='inline-flex items-center'
          disabled={isSpeaking}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='w-5 h-5 mr-2'
          >
            <path d='M11 5L6 9H2v6h4l5 4V5z'></path>
            <path d='M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07'></path>
          </svg>
          {isSpeaking ? '재생 중...' : '발음 듣기'}
        </Button>

        <Button
          onClick={toggleAutoPlay}
          variant={autoPlayEnabled ? 'outline' : 'outline'}
          className='inline-flex items-center'
        >
          {autoPlayEnabled ? '자동 재생 켜짐' : '자동 재생 꺼짐'}
        </Button>
      </div>

      {error && (
        <div className='text-red-500 text-sm text-center mb-4'>
          {error}
          {error.includes('자동 재생') && (
            <div className='mt-1'>
              <Button onClick={handlePlayAudio} variant='secondary' size='sm'>
                다시 재생 시도
              </Button>
            </div>
          )}
        </div>
      )}

      <div className='flex justify-between mt-6'>
        <Button
          onClick={handlePrevious}
          variant='outline'
          disabled={currentIndex === 0}
        >
          이전
        </Button>

        <div className='flex space-x-2'>
          <Button
            onClick={() => handleMarkStatus('learning')}
            variant='secondary'
          >
            다시 보기
          </Button>
          <Button
            onClick={() => handleMarkStatus('learned')}
            variant='secondary'
          >
            알고 있음
          </Button>
        </div>

        <Button
          onClick={handleNext}
          variant='outline'
          disabled={currentIndex === totalCards - 1}
        >
          다음
        </Button>
      </div>
    </div>
  );
}

export default CardDeck;

```

# components/learn/CsvImport.tsx

```tsx
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
    // 'learningCards' 키로 저장 (Stage1Page와 일치하도록)
    localStorage.setItem('learningCards', JSON.stringify(cards));
    onCardsLoaded(cards);

    // 현재 페이지에 머무름 (라우팅 제거)
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

```

# components/learn/Stage1Exercise.tsx

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/types/card';
import { checkSimilarity } from '@/lib/utils/csv-parser';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';

interface Stage1ExerciseProps {
  cards: Card[];
  onComplete?: () => void;
  className?: string;
}

export function Stage1Exercise({
  cards,
  onComplete,
  className = '',
}: Stage1ExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const isLastCard = currentIndex === totalCards - 1;

  const handleCheck = () => {
    const result = checkSimilarity(userInput, currentCard.target);
    const { isCorrect, similarity, missingWords, extraWords } = result;

    // 피드백 메시지 구성
    let message = '';
    if (isCorrect) {
      message = '정답입니다!';
    } else {
      message = '틀렸습니다. ';
      
      // 유사도에 따른 피드백
      if (similarity > 0.5) {
        message += '가까워지고 있어요! ';
      }
      
      // 누락된 단어가 있는 경우 피드백
      if (missingWords.length > 0) {
        message += `누락된 단어: ${missingWords.slice(0, 3).join(', ')}${missingWords.length > 3 ? '...' : ''} `;
      }
      
      message += '다시 시도하거나 정답을 확인하세요.';
    }

    setFeedback({
      isCorrect,
      message,
    });

    if (isCorrect) {
      setCompletedCount((prev) => prev + 1);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (isLastCard) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    // 입력이 변경되면 피드백과 정답 표시를 초기화
    setFeedback(null);
    setShowAnswer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          진행도: {currentIndex + 1} / {totalCards} (완료: {completedCount})
        </p>
      </div>

      <div className='bg-[hsl(var(--card))] rounded-xl shadow-md p-6 mb-6 border border-[hsl(var(--border))]'>
        <div className='mb-6'>
          <p className='font-medium mb-2'>한국어 문장:</p>
          <p className='text-lg'>{currentCard.native}</p>
        </div>

        <div className='mb-6'>
          <p className='font-medium mb-2'>영어로 작성해보세요:</p>
          <TextInput
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='영어 문장을 입력하세요...'
            className='w-full'
          />
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-md mb-4 ${
              feedback.isCorrect
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {showAnswer && (
          <div className='p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md mb-4'>
            <p className='font-medium'>정답:</p>
            <p>{currentCard.target}</p>
          </div>
        )}

        <div className='flex justify-between'>
          <div className='space-x-2'>
            <Button onClick={handleCheck} variant='secondary'>
              확인
            </Button>
            <Button onClick={handleShowAnswer} variant='outline'>
              정답 보기
            </Button>
          </div>

          <div className='space-x-2'>
            <Button onClick={handleSkip} variant='outline'>
              건너뛰기
            </Button>
            <Button
              onClick={handleNext}
              variant='secondary'
              disabled={!feedback?.isCorrect && !showAnswer}
            >
              {isLastCard ? '완료' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stage1Exercise;

```

# components/learn/Stage2Flashcards.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card as CardType, CARD_STATUS } from '@/types/card';
import { CardDeck } from './CardDeck';
import Button from '@/components/ui/Button';

interface Stage2FlashcardsProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

export function Stage2Flashcards({
  cards: initialCards,
  onComplete,
  className = '',
}: Stage2FlashcardsProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [studyMode, setStudyMode] = useState<'all' | 'unseen' | 'learning'>(
    'all'
  );
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unseen: 0,
    learning: 0,
    learned: 0,
  });

  useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      setCards(initialCards);
    }
  }, [initialCards]);

  // 카드 상태에 따라 필터링하고 통계 업데이트
  useEffect(() => {
    const unseenCards = cards.filter(
      (card) => card.status === CARD_STATUS.UNSEEN
    );
    const learningCards = cards.filter(
      (card) => card.status === CARD_STATUS.LEARNING
    );
    const learnedCards = cards.filter(
      (card) => card.status === CARD_STATUS.LEARNED
    );

    setStats({
      total: cards.length,
      unseen: unseenCards.length,
      learning: learningCards.length,
      learned: learnedCards.length,
    });

    let filtered;
    switch (studyMode) {
      case 'unseen':
        filtered = unseenCards;
        break;
      case 'learning':
        filtered = learningCards;
        break;
      case 'all':
      default:
        filtered = cards;
        break;
    }

    setFilteredCards(filtered);
  }, [cards, studyMode]);

  const handleCardStatusChange = (
    cardId: number,
    newStatus: CardType['status']
  ) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );
  };

  const handleModeChange = (mode: 'all' | 'unseen' | 'learning') => {
    setStudyMode(mode);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-6'>
        <div className='flex flex-wrap gap-2 mb-4'>
          <Button
            onClick={() => handleModeChange('all')}
            variant={studyMode === 'all' ? 'secondary' : 'outline'}
          >
            전체 ({stats.total})
          </Button>
          <Button
            onClick={() => handleModeChange('unseen')}
            variant={studyMode === 'unseen' ? 'secondary' : 'outline'}
          >
            미학습 ({stats.unseen})
          </Button>
          <Button
            onClick={() => handleModeChange('learning')}
            variant={studyMode === 'learning' ? 'secondary' : 'outline'}
          >
            학습 중 ({stats.learning})
          </Button>
        </div>

        <div className='p-4 bg-gray-100 rounded-md mb-4'>
          <p className='font-medium'>학습 통계:</p>
          <p>
            학습 완료: {Math.round((stats.learned / stats.total) * 100)}% (
            {stats.learned}/{stats.total})
          </p>
        </div>
      </div>

      {filteredCards.length > 0 ? (
        <CardDeck
          cards={filteredCards}
          onCardStatusChange={handleCardStatusChange}
        />
      ) : (
        <div className='text-center p-8 bg-gray-100 rounded-md'>
          <p className='text-lg'>해당 카테고리에 카드가 없습니다.</p>
          <Button
            onClick={() => handleModeChange('all')}
            variant='secondary'
            className='mt-4'
          >
            전체 카드 보기
          </Button>
        </div>
      )}

      <div className='mt-8 text-center'>
        <Button onClick={handleComplete} variant='secondary'>
          학습 완료
        </Button>
      </div>
    </div>
  );
}

export default Stage2Flashcards;

```

# components/learn/Stage3Podcast.tsx

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/types/card';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';
import Button from '@/components/ui/Button';

interface PodcastContent {
  context?: string;
  nativeExpressions?: string[];
  sampleConversation?: string;
  loading: boolean;
  error?: string;
}

interface Stage3PodcastProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

export function Stage3Podcast({
  cards,
  onComplete,
  className = '',
}: Stage3PodcastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [podcastContent, setPodcastContent] = useState<PodcastContent>({
    loading: false,
  });
  const [audioError, setAudioError] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('Jasper'); // UnrealSpeech 기본 음성

  // UnrealSpeech로 TTS 구현
  const {
    speak,
    stop,
    isSpeaking,
    error: ttsError,
  } = useUnrealSpeech({
    voice: voiceName,
    speed: playbackSpeed - 1, // UnrealSpeech의 speed는 -1에서 1 사이의 값을 가짐
    pitch: 1.0,
  });

  // 문장이 변경될 때마다 UnrealSpeech API 호출
  useEffect(() => {
    if (cards && cards.length > 0) {
      fetchPodcastContent(cards[currentIndex]);
    }
  }, [currentIndex, cards]);

  // UnrealSpeech API 호출하여 팟캐스트 콘텐츠 가져오기
  const fetchPodcastContent = useCallback(async (card: CardType) => {
    setPodcastContent({ loading: true });

    try {
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentence: card.target,
          nativeSentence: card.native,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '콘텐츠 생성 실패');
      }

      const data = await response.json();
      setPodcastContent({
        context: data.context,
        nativeExpressions: data.nativeExpressions,
        sampleConversation: data.sampleConversation,
        loading: false,
      });
    } catch (error) {
      console.error('팟캐스트 콘텐츠 가져오기 오류:', error);
      setPodcastContent({
        loading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 오디오 정리
      stop();
    };
  }, [stop]);

  // 사용자 상호작용 발생 시 오류 메시지 초기화
  const clearErrorOnUserInteraction = useCallback(() => {
    setAudioError(null);
  }, []);

  // 전체 팟캐스트 내용을 음성으로 재생할 텍스트로 준비
  const getPodcastText = useCallback(() => {
    if (
      !podcastContent.context &&
      !podcastContent.nativeExpressions &&
      !podcastContent.sampleConversation
    ) {
      return '';
    }

    let fullText = '';

    // Context 추가
    if (podcastContent.context) {
      fullText += podcastContent.context + '. ';
    }

    // Native Expressions 추가
    if (
      podcastContent.nativeExpressions &&
      podcastContent.nativeExpressions.length > 0
    ) {
      fullText += 'Native expressions: ';
      fullText += podcastContent.nativeExpressions.join('. ') + '. ';
    }

    // Sample Conversation 추가 (A:, B: 등 대화자 구분 제거)
    if (podcastContent.sampleConversation) {
      fullText += 'Conversation: ';
      // A:, B: 등 대화자 구분 제거
      const cleanedConversation = podcastContent.sampleConversation
        .replace(/^[A-Z]:\s*/gm, '') // 각 줄 시작의 "A: ", "B: " 등 제거
        .replace(/\n[A-Z]:\s*/g, '\n'); // 줄 중간의 대화자 구분도 제거

      fullText += cleanedConversation;
    }

    return fullText;
  }, [podcastContent]);

  // 음성 재생 함수 - 사용자 상호작용에 의해 호출됨
  const handlePlay = useCallback(async () => {
    clearErrorOnUserInteraction();

    // 이미 재생 중인 경우 중복 호출 방지
    if (isSpeaking) return;

    const podcastText = getPodcastText();
    if (podcastText) {
      try {
        await speak(podcastText);
      } catch (error) {
        console.error('팟캐스트 재생 오류:', error);
        setAudioError('음성 재생 중 오류가 발생했습니다.');
      }
    }
  }, [
    clearErrorOnUserInteraction,
    getPodcastText,
    isSpeaking,
    speak,
    setAudioError,
  ]);

  // 음성 중지 함수
  const handleStop = () => {
    clearErrorOnUserInteraction();
    stop();
  };

  const handleToggleTranslation = () => {
    clearErrorOnUserInteraction();
    setShowTranslation(!showTranslation);
  };

  const handlePrevious = () => {
    clearErrorOnUserInteraction();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
      stop();
    }
  };

  // 자동 재생 토글
  const handleToggleAutoPlay = () => {
    clearErrorOnUserInteraction();
    const newAutoPlayValue = !isAutoPlay;
    setIsAutoPlay(newAutoPlayValue);

    // 자동 재생 활성화 시 현재 문장부터 재생 시도
    if (newAutoPlayValue && !isSpeaking) {
      // 약간의 지연 후 재생 시도 (UI 업데이트 후)
      setTimeout(() => {
        handlePlay();
      }, 100);
    }
  };

  // 다음 버튼 처리
  const handleNext = useCallback(() => {
    clearErrorOnUserInteraction();

    const isLastCard = currentIndex === cards.length - 1;

    if (isLastCard) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // 현재 재생 중인 오디오 중지
    if (isSpeaking) {
      stop();
    }

    setCurrentIndex(currentIndex + 1);
    setShowTranslation(false);

    // 다음 콘텐츠를 가져올 때까지 기다린 후 재생 시도
    const nextCard = cards[currentIndex + 1];
    fetchPodcastContent(nextCard).then(() => {
      // 자동 재생이 활성화되어 있을 때만 재생
      if (isAutoPlay) {
        // 약간의 지연 후 재생 시도 (UI 업데이트 후)
        setTimeout(() => {
          handlePlay();
        }, 500);
      }
    });
  }, [
    currentIndex,
    cards,
    onComplete,
    isSpeaking,
    stop,
    isAutoPlay,
    setCurrentIndex,
    setShowTranslation,
    clearErrorOnUserInteraction,
    fetchPodcastContent,
    handlePlay,
  ]);

  // 자동 재생 처리
  useEffect(() => {
    // 자동 재생은 사용자가 명시적으로 활성화한 경우에만 작동
    if (isAutoPlay && !isSpeaking && currentIndex < cards.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2000); // 문장 사이에 2초 간격

      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isSpeaking, currentIndex, cards.length, handleNext]);

  // TTS 오류 처리
  useEffect(() => {
    if (ttsError) {
      setAudioError(ttsError);

      // 오류 발생 시 자동 재생 중지
      if (isAutoPlay) {
        setIsAutoPlay(false);
      }
    }
  }, [ttsError, isAutoPlay]);

  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const isLastCard = currentIndex === totalCards - 1;

  const handleSetPlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleRefreshContent = () => {
    clearErrorOnUserInteraction();
    if (currentCard) {
      fetchPodcastContent(currentCard);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          {currentIndex + 1} / {totalCards}
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
        <div className='mb-6'>
          <p className='font-medium mb-2'>영어 문장:</p>
          <p className='text-lg mb-4'>{currentCard.target}</p>

          {showTranslation && (
            <div className='p-4 bg-gray-100 rounded-md'>
              <p className='font-medium mb-1'>한국어 번역:</p>
              <p>{currentCard.native}</p>
            </div>
          )}
        </div>

        {/* 음성 재생 버튼 */}
        <div className='flex flex-wrap gap-2 mb-6'>
          {isSpeaking ? (
            <Button
              onClick={handleStop}
              variant='outline'
              disabled={!isSpeaking}
            >
              중지
            </Button>
          ) : (
            <Button
              onClick={handlePlay}
              variant='secondary'
              disabled={isSpeaking || !podcastContent.sampleConversation}
            >
              재생
            </Button>
          )}

          <Button onClick={handleToggleTranslation} variant='outline'>
            {showTranslation ? '번역 숨기기' : '번역 보기'}
          </Button>
        </div>

        {/* UnrealSpeech로 생성된 콘텐츠 */}
        <div className='mt-8 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold'>Podcast Learning</h3>
            <Button
              onClick={handleRefreshContent}
              variant='outline'
              className='text-xs'
              disabled={podcastContent.loading}
            >
              {podcastContent.loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {podcastContent.loading ? (
            <div className='py-4 text-center text-gray-500'>
              Generating podcast content...
            </div>
          ) : podcastContent.error ? (
            <div className='p-4 bg-red-50 text-red-500 rounded-md'>
              <p className='font-medium'>Error</p>
              <p className='text-sm'>{podcastContent.error}</p>
              <Button
                onClick={handleRefreshContent}
                variant='outline'
                className='mt-2 text-xs'
              >
                Try again
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* 문맥 정보 */}
              {podcastContent.context && (
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='font-medium mb-1'>Context:</p>
                  <p className='text-sm'>{podcastContent.context}</p>
                </div>
              )}

              {/* 네이티브 표현 */}
              {podcastContent.nativeExpressions &&
                podcastContent.nativeExpressions.length > 0 &&
                (() => {
                  // 로컬 변수에 할당하여 TypeScript 오류 방지
                  const expressions = podcastContent.nativeExpressions;
                  return (
                    <div className='bg-blue-50 rounded-lg p-4'>
                      <p className='font-medium mb-2'>Native Expressions:</p>
                      <div className='text-sm space-y-3'>
                        {expressions.map((expr, idx) => (
                          <div key={idx} className='podcast-expression'>
                            <p className='whitespace-pre-wrap leading-relaxed'>
                              {expr}
                            </p>
                            {idx !== expressions.length - 1 && (
                              <div className='my-2 border-b border-blue-100'></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* 샘플 대화 */}
              {podcastContent.sampleConversation && (
                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <p className='font-medium'>Sample Conversation:</p>
                  </div>
                  <pre className='text-sm whitespace-pre-wrap font-sans leading-relaxed'>
                    {podcastContent.sampleConversation}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 오디오 관련 오류 메시지 */}
        {audioError && (
          <div className='text-amber-600 text-sm mb-4 p-3 bg-amber-50 rounded border border-amber-200'>
            <div className='flex items-start'>
              <svg
                className='w-5 h-5 mr-2 mt-0.5 text-amber-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                ></path>
              </svg>
              <div>
                <p className='font-medium'>음성 재생 알림</p>
                <p className='mt-1 text-sm'>
                  음성 재생에 문제가 있습니다. 다시 시도해주세요.
                </p>
                <div className='mt-2 flex gap-2'>
                  <Button
                    onClick={clearErrorOnUserInteraction}
                    variant='outline'
                    className='text-xs py-1'
                  >
                    확인
                  </Button>
                  <Button
                    onClick={handleRefreshContent}
                    variant='outline'
                    className='text-xs py-1'
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 재생 상태 표시 */}
        {isSpeaking && (
          <div className='animate-pulse flex items-center gap-2 text-blue-500 text-sm mb-4'>
            <svg
              className='w-4 h-4'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z'
                clipRule='evenodd'
              />
            </svg>
            <span>
              <span className='font-medium text-blue-600'>UnrealSpeech</span>로
              재생 중...
            </span>
          </div>
        )}

        <div className='mb-6'>
          <p className='font-medium mb-2'>재생 속도:</p>
          <div className='flex flex-wrap gap-2'>
            {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
              <Button
                key={speed}
                onClick={() => handleSetPlaybackSpeed(speed)}
                variant={playbackSpeed === speed ? 'secondary' : 'outline'}
                className='text-sm'
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        <div className='mb-4 text-sm text-gray-600'>
          사용 중인 음성: {voiceName}
        </div>

        <div className='mb-4'>
          <p className='font-medium mb-2'>Voice:</p>
          <div className='flex flex-wrap gap-2'>
            {['Jasper', 'Eleanor', 'Melody', 'Lauren', 'Luna'].map((voice) => (
              <Button
                key={voice}
                onClick={() => setVoiceName(voice)}
                variant={voiceName === voice ? 'secondary' : 'outline'}
                className='text-sm'
              >
                {voice}
              </Button>
            ))}
          </div>
        </div>

        <div className='flex justify-between items-center'>
          <Button
            onClick={handleToggleAutoPlay}
            variant={isAutoPlay ? 'secondary' : 'outline'}
          >
            {isAutoPlay ? '자동 재생 중지' : '자동 재생'}
          </Button>

          <div className='flex gap-2'>
            <Button
              onClick={handlePrevious}
              variant='outline'
              disabled={currentIndex === 0}
            >
              이전
            </Button>
            <Button onClick={handleNext} variant='secondary'>
              {isLastCard ? '완료' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stage3Podcast;

```

# components/learn/Stage4Speaking.tsx

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType } from '@/types/card';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import { useUnrealSpeech } from '@/lib/hooks/useUnrealSpeech';
import { checkSimilarity } from '@/lib/utils/csv-parser';
import Button from '@/components/ui/Button';

interface Stage4SpeakingProps {
  cards: CardType[];
  onComplete?: () => void;
  className?: string;
}

// 학습 진행 상태 인터페이스
interface CardProgress {
  cardId: number;
  attempts: number;
  isCompleted: boolean;
  lastSimilarity: number;
  lastAttemptTime?: number; // 마지막 시도 시간
}

// 피드백 인터페이스
interface Feedback {
  isCorrect: boolean;
  message: string;
  similarity: number;
  missingWords: string[];
  extraWords: string[];
}

// 로컬 스토리지 키
const STAGE4_PROGRESS_KEY = 'stage4Progress';
const REQUIRED_ATTEMPTS_FOR_COMPLETION = 3; // 학습 완료로 간주하기 위한 최소 시도 횟수

export function Stage4Speaking({
  cards,
  onComplete,
  className = '',
}: Stage4SpeakingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTargetText, setShowTargetText] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    isSpeaking: isUserSpeaking,
    confidence,
    error: recognitionError,
  } = useSpeechRecognition({
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3,
    autoStop: true,
    silenceTimeout: 2000,
  });

  const {
    speak,
    isSpeaking: isSystemSpeaking,
    error: speakError,
  } = useUnrealSpeech({
    apiKey: process.env.NEXT_PUBLIC_UNREALSPEECH_API_KEY,
    voice: 'Jasper', // 남성 목소리: Jasper, Daniel, Oliver 등
    bitrate: '128k',
    speed: -0.2,
    pitch: 1.0,
  });

  // 오류 처리 통합
  const error = recognitionError || speakError;

  // 현재 카드와 관련 상태 계산
  const currentCard = cards && cards.length > 0 ? cards[currentIndex] : null;
  const totalCards = cards ? cards.length : 0;
  const isLastCard = currentIndex === totalCards - 1;

  // 카드별 진행 상태 초기화 및 로컬 스토리지에서 불러오기
  useEffect(() => {
    if (cards && cards.length > 0) {
      try {
        // 로컬 스토리지에서 진행 상태 불러오기
        const savedProgress = localStorage.getItem(STAGE4_PROGRESS_KEY);

        if (savedProgress) {
          const parsedProgress: CardProgress[] = JSON.parse(savedProgress);

          // 카드 ID와 일치하는 진행 상태만 사용
          if (parsedProgress.length > 0) {
            // 기존 카드와 일치하는 진행 상태만 필터링
            const validProgress = parsedProgress.filter((progress) =>
              cards.some((card) => card.id === progress.cardId)
            );

            if (validProgress.length > 0) {
              setCardProgress(validProgress);

              // 완료된 카드 수 계산
              const completed = validProgress.filter(
                (p) => p.isCompleted
              ).length;
              setCompletedCount(completed);

              // 총 시도 횟수 계산
              const totalAttempts = validProgress.reduce(
                (sum, p) => sum + p.attempts,
                0
              );
              setAttemptCount(totalAttempts);

              console.log('4단계 진행 상태를 로드했습니다:', validProgress);
              return;
            }
          }
        }

        // 저장된 데이터가 없거나 유효하지 않은 경우 초기 상태 생성
        const initialProgress = cards.map((card) => ({
          cardId: card.id,
          attempts: 0,
          isCompleted: false,
          lastSimilarity: 0,
          lastAttemptTime: Date.now(),
        }));

        setCardProgress(initialProgress);
        console.log('새로운 4단계 진행 상태를 초기화했습니다.');
      } catch (error) {
        console.error('진행 상태 로드 중 오류:', error);

        // 오류 발생 시 초기 상태로 설정
        const initialProgress = cards.map((card) => ({
          cardId: card.id,
          attempts: 0,
          isCompleted: false,
          lastSimilarity: 0,
          lastAttemptTime: Date.now(),
        }));

        setCardProgress(initialProgress);
      }
    }
  }, [cards]);

  // 진행 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (cardProgress.length > 0) {
      try {
        localStorage.setItem(STAGE4_PROGRESS_KEY, JSON.stringify(cardProgress));
      } catch (error) {
        console.error('진행 상태 저장 중 오류:', error);
      }
    }
  }, [cardProgress]);

  // 현재 카드의 진행 상태
  const currentCardProgress = cardProgress.find(
    (p) => currentCard && p.cardId === currentCard.id
  );

  // 정확도 확인 함수
  const checkAccuracy = useCallback(() => {
    if (!transcript || !currentCard) return;

    const similarityResult = checkSimilarity(transcript, currentCard.target);
    const { isCorrect, similarity, missingWords, extraWords } =
      similarityResult;

    // 인식 신뢰도와 유사도를 고려한 피드백 메시지 생성
    let message = '';
    if (isCorrect) {
      if (similarity >= 0.95) {
        message = '완벽합니다! 발음과 문장이 정확합니다. 👏';
      } else if (similarity >= 0.85) {
        message = '훌륭합니다! 문장을 잘 전달했습니다. 👍';
      } else {
        message = '좋습니다! 핵심 내용을 전달했습니다. ✓';
      }
    } else {
      if (similarity >= 0.7) {
        message = '거의 정확합니다! 일부 단어가 다르거나 빠졌습니다.';
      } else if (similarity >= 0.5) {
        message = '부분적으로 정확합니다. 다시 시도해보세요.';
      } else if (confidence < 0.6) {
        message =
          '음성 인식이 잘 되지 않았습니다. 더 크고 명확하게 발음해보세요.';
      } else {
        message = '다시 시도해보세요. 문장이 많이 다릅니다.';
      }
    }

    // 피드백 설정
    setFeedback({
      isCorrect,
      message,
      similarity,
      missingWords,
      extraWords,
    });

    // 카드 진행 상태 업데이트
    setCardProgress((prev) => {
      const newProgress = [...prev];
      const currentCardIndex = newProgress.findIndex(
        (p) => currentCard && p.cardId === currentCard.id
      );

      if (currentCardIndex >= 0) {
        const card = newProgress[currentCardIndex];
        card.attempts += 1;
        card.lastSimilarity = similarity;
        card.lastAttemptTime = Date.now();

        // 완료 조건: 정확하게 말했거나, 특정 횟수 이상 시도했으며 어느 정도 유사도가 있는 경우
        const isCompletedNow =
          isCorrect ||
          (card.attempts >= REQUIRED_ATTEMPTS_FOR_COMPLETION &&
            similarity >= 0.5);

        // 이미 완료된 상태가 아니고, 현재 완료 조건을 충족한 경우에만 완료 상태 업데이트
        if (!card.isCompleted && isCompletedNow) {
          card.isCompleted = true;
          setCompletedCount((prev) => prev + 1);
        }
      }

      return newProgress;
    });

    // 전체 시도 횟수 증가
    setAttemptCount((prev) => prev + 1);
  }, [transcript, currentCard, confidence]);

  // 시작 버튼 핸들러
  const handleListening = useCallback(() => {
    resetTranscript();
    setFeedback(null);
    startListening();
  }, [resetTranscript, startListening]);

  // 중지 버튼 핸들러
  const handleStopListening = useCallback(() => {
    stopListening();
    if (transcript) {
      checkAccuracy();
    }
  }, [stopListening, transcript, checkAccuracy]);

  // 예제 재생 핸들러
  const handlePlayExample = useCallback(() => {
    if (currentCard) {
      speak(currentCard.target);
    }
  }, [currentCard, speak]);

  // 번역 토글 핸들러
  const handleToggleTranslation = useCallback(() => {
    setShowTranslation((prev) => !prev);
  }, []);

  // 텍스트 표시 토글 핸들러
  const handleToggleTargetText = useCallback(() => {
    setShowTargetText((prev) => !prev);
  }, []);

  // 이전 버튼 핸들러
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTranscript();
      setFeedback(null);
      setShowTranslation(false);
      setShowTargetText(false);
    }
  }, [currentIndex, resetTranscript]);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    if (isLastCard) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    setCurrentIndex(currentIndex + 1);
    resetTranscript();
    setFeedback(null);
    setShowTranslation(false);
    setShowTargetText(false);
  }, [currentIndex, isLastCard, onComplete, resetTranscript]);

  // transcript가 변경될 때마다 자동으로 정확도 체크
  useEffect(() => {
    if (transcript && currentCard && !isListening) {
      checkAccuracy();
    }
  }, [transcript, isListening, checkAccuracy, currentCard]);

  // 전체 학습 진행률 계산 (PRD 요구사항: 일정 수준 이상 정확도로 말하기 성공 또는 일정 횟수 이상 시도)
  const progressPercentage =
    totalCards > 0 ? (completedCount / totalCards) * 100 : 0;

  // 카드가 없는 경우 처리
  if (!cards || cards.length === 0) {
    return (
      <div className='text-center p-8'>
        <p className='text-lg'>
          카드가 없습니다. CSV 파일을 먼저 업로드해주세요.
        </p>
      </div>
    );
  }

  // 음성 인식 미지원 브라우저 처리
  if (!hasRecognitionSupport) {
    return (
      <div className='text-center p-8 bg-yellow-100 rounded-md'>
        <p className='text-lg'>
          현재 브라우저는 음성인식 기능을 지원하지 않습니다.
        </p>
        <p className='mt-2'>Chrome 브라우저를 사용해주세요.</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-4 text-center'>
        <p className='text-sm text-gray-600'>
          진행도: {currentIndex + 1} / {totalCards} (완료한 문장:{' '}
          {completedCount}, 총 시도: {attemptCount})
        </p>
        <div className='w-full h-2 bg-gray-200 rounded-full mt-2'>
          <div
            className='h-full bg-green-500 rounded-full'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className='p-4 mb-4 text-sm text-red-500 bg-red-100 rounded-md'>
          음성 서비스 오류: {error}
        </div>
      )}

      <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <p className='font-medium'>한국어 문장:</p>
            <div className='flex space-x-2'>
              <Button
                onClick={handleToggleTranslation}
                variant='outline'
                className='text-sm'
              >
                {showTranslation ? '번역 숨기기' : '번역 보기'}
              </Button>
              {currentCardProgress && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentCardProgress.isCompleted
                      ? 'bg-green-100 text-green-800'
                      : currentCardProgress.attempts > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currentCardProgress.isCompleted
                    ? '완료'
                    : currentCardProgress.attempts > 0
                    ? `시도: ${currentCardProgress.attempts}`
                    : '미시도'}
                </span>
              )}
            </div>
          </div>
          <p className='text-lg mb-4'>{currentCard?.native}</p>

          {showTranslation && (
            <div className='p-4 bg-gray-100 rounded-md mb-4'>
              <div className='flex justify-between items-center mb-1'>
                <p className='font-medium'>영어 문장:</p>
                <Button
                  onClick={handlePlayExample}
                  variant='outline'
                  className='text-sm'
                  disabled={isSystemSpeaking}
                >
                  들어보기
                </Button>
              </div>
              {showTargetText ? (
                <p>{currentCard?.target}</p>
              ) : (
                <Button
                  onClick={handleToggleTargetText}
                  variant='ghost'
                  className='text-sm'
                >
                  텍스트 보기
                </Button>
              )}
            </div>
          )}
        </div>

        <div className='mb-6'>
          <p className='font-medium mb-2'>말하기 연습:</p>
          <div className='p-4 bg-gray-100 rounded-md mb-4 min-h-[100px] relative'>
            {transcript ? (
              <p>{transcript}</p>
            ) : (
              <p className='text-gray-400'>
                {isListening
                  ? isUserSpeaking
                    ? '말하는 중...'
                    : '소리가 감지되지 않습니다. 말씀해주세요.'
                  : '버튼을 누르고 영어로 말해보세요.'}
              </p>
            )}

            {isListening && (
              <div className='absolute top-2 right-2 flex items-center'>
                <div className='flex space-x-1 mr-2'>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking
                        ? 'bg-red-500 animate-pulse delay-150'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking
                        ? 'bg-red-500 animate-pulse delay-300'
                        : 'bg-gray-300'
                    }`}
                  ></span>
                </div>
                {confidence > 0 && (
                  <span className='text-xs text-gray-500'>
                    {Math.round(confidence * 100)}%
                  </span>
                )}
              </div>
            )}
          </div>

          <div className='flex justify-center space-x-4'>
            {isListening ? (
              <Button
                onClick={handleStopListening}
                variant='outline'
                className='px-6'
              >
                멈추기
              </Button>
            ) : (
              <Button
                onClick={handleListening}
                variant='secondary'
                className='px-6'
              >
                말하기 시작
              </Button>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-md mb-6 ${
              feedback.isCorrect
                ? 'bg-green-100 text-green-800'
                : feedback.similarity >= 0.5
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <div className='font-medium mb-1'>{feedback.message}</div>

            {!feedback.isCorrect && (
              <div className='mt-2'>
                {feedback.missingWords.length > 0 && (
                  <div className='text-sm'>
                    <span className='font-medium'>빠진 단어:</span>{' '}
                    {feedback.missingWords.join(', ')}
                  </div>
                )}
                {feedback.extraWords.length > 0 && (
                  <div className='text-sm'>
                    <span className='font-medium'>추가된 단어:</span>{' '}
                    {feedback.extraWords.join(', ')}
                  </div>
                )}
                <div className='mt-2 text-sm flex items-center'>
                  <span className='font-medium mr-2'>정확도:</span>
                  <div className='w-24 h-2 bg-gray-300 rounded-full'>
                    <div
                      className={`h-full rounded-full ${
                        feedback.similarity >= 0.8
                          ? 'bg-green-500'
                          : feedback.similarity >= 0.5
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${feedback.similarity * 100}%` }}
                    ></div>
                  </div>
                  <span className='ml-2'>
                    {Math.round(feedback.similarity * 100)}%
                  </span>
                </div>

                {!showTargetText && (
                  <div className='mt-3'>
                    <Button
                      onClick={handleToggleTargetText}
                      variant='outline'
                      className='text-xs'
                    >
                      정답 보기
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 정답이거나 여러 번 시도했을 때 다음 문장으로 유도 */}
            {(feedback.isCorrect ||
              (currentCardProgress &&
                currentCardProgress.attempts >=
                  REQUIRED_ATTEMPTS_FOR_COMPLETION)) &&
              !isLastCard && (
                <div className='mt-3'>
                  <Button
                    onClick={handleNext}
                    variant='outline'
                    className='text-xs'
                  >
                    다음 문장으로
                  </Button>
                </div>
              )}
          </div>
        )}

        <div className='flex justify-between'>
          <Button
            onClick={handlePrevious}
            variant='outline'
            disabled={currentIndex === 0}
          >
            이전
          </Button>

          <Button onClick={handleNext} variant='secondary'>
            {isLastCard ? '완료' : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Stage4Speaking;

```

# components/providers/theme-provider.tsx

```tsx
'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemeProvider attribute='class' defaultTheme='system' enableSystem>
      {children}
    </NextThemeProvider>
  );
}

export default ThemeProvider;

```

# components/ui/Button.tsx

```tsx
'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// 버튼 스타일 변형 정의
const buttonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      // 버튼 유형
      variant: {
        default:
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90',
        destructive:
          'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90',
        outline:
          'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
        secondary:
          'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80',
        ghost:
          'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
        link: 'text-[hsl(var(--primary))] underline-offset-4 hover:underline',
      },
      // 버튼 크기
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      // 버튼 너비
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// 버튼 컴포넌트 props 타입 정의
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * 재사용 가능한 버튼 컴포넌트입니다.
 * 다양한 스타일 변형과 상태를 지원합니다.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      startIcon,
      endIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 로딩 상태나 disabled일 때 버튼을 비활성화
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className='w-4 h-4 mr-2 animate-spin'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            로딩 중...
          </>
        ) : (
          <>
            {startIcon && <span className='mr-2'>{startIcon}</span>}
            {children}
            {endIcon && <span className='ml-2'>{endIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

// 컴포넌트 디스플레이 이름 설정
Button.displayName = 'Button';

export { buttonVariants };
export default Button;

```

# components/ui/TextArea.tsx

```tsx
'use client';

import React, { forwardRef } from 'react';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        className={`w-full px-3 py-2 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--input))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

```

# components/ui/TextInput.tsx

```tsx
'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/cn';

// 입력 필드 스타일 변형 정의
const inputVariants = cva(
  // 기본 스타일
  'flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      // 입력 필드 상태
      state: {
        default: 'border-[hsl(var(--border))]',
        error:
          'border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]',
        success:
          'border-[hsl(var(--success))] focus-visible:ring-[hsl(var(--success))]',
      },
      // 입력 필드 크기
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs px-2.5',
        lg: 'h-12 text-base px-4',
      },
      // 꽉 찬 너비 여부
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'default',
    },
  }
);

// 입력 필드 래퍼 스타일 정의
const inputWrapperVariants = cva('relative flex items-center', {
  variants: {
    // 꽉 찬 너비 여부 (래퍼용)
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});

// TextInput Props 타입 정의
export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: string;
  label?: string;
  helpText?: string;
}

/**
 * 재사용 가능한 텍스트 입력 컴포넌트
 * 다양한 상태(오류, 성공)와 크기, 아이콘을 지원합니다.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      state,
      size,
      fullWidth,
      leftIcon,
      rightIcon,
      error,
      success,
      label,
      helpText,
      disabled,
      ...props
    },
    ref
  ) => {
    // 상태에 따른 스타일 결정
    const inputState = error ? 'error' : success ? 'success' : state;

    // 메시지 텍스트와 색상 결정
    const messageText = error || success || helpText;
    const messageColor = error
      ? 'text-[hsl(var(--destructive))]'
      : success
      ? 'text-[hsl(var(--success))]'
      : 'text-[hsl(var(--muted-foreground))]';

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className='text-sm font-medium text-[hsl(var(--foreground))]'
          >
            {label}
          </label>
        )}

        <div className={cn(inputWrapperVariants({ fullWidth }))}>
          {leftIcon && (
            <div className='absolute left-3 flex items-center pointer-events-none text-[hsl(var(--muted-foreground))]'>
              {leftIcon}
            </div>
          )}

          <input
            className={cn(
              inputVariants({ state: inputState, size, fullWidth }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div className='absolute right-3 flex items-center text-[hsl(var(--muted-foreground))]'>
              {rightIcon}
            </div>
          )}
        </div>

        {messageText && (
          <p className={cn('text-xs', messageColor)}>{messageText}</p>
        )}
      </div>
    );
  }
);

// 컴포넌트 디스플레이 이름 설정
TextInput.displayName = 'TextInput';

export { inputVariants };
export default TextInput;

```

# components/ui/ThemeToggle.tsx

```tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // mounted 상태 확인 (hydration 문제 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        // 햇빛 아이콘 (라이트 모드로 전환)
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='12' cy='12' r='5' />
          <line x1='12' y1='1' x2='12' y2='3' />
          <line x1='12' y1='21' x2='12' y2='23' />
          <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
          <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
          <line x1='1' y1='12' x2='3' y2='12' />
          <line x1='21' y1='12' x2='23' y2='12' />
          <line x1='4.22' y1='19.78' x2='5.64' y2='18.36' />
          <line x1='18.36' y1='5.64' x2='19.78' y2='4.22' />
        </svg>
      ) : (
        // 달 아이콘 (다크 모드로 전환)
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;

```

# eslint.config.mjs

```mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;

```

# lib/hooks/useGeminiSpeech.ts

```ts
import { useState, useCallback, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

interface UseGeminiSpeechOptions {
  speed?: number;
  voice?: string;
}

interface UseGeminiSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  error: string | null;
}

/**
 * Gemini-2.0-flash-lite 모델을 사용하여 TTS 기능을 제공하는 커스텀 훅
 * 실제로는 Gemini가 생성한 텍스트를 브라우저 TTS로 읽게 함
 */
export function useGeminiSpeech({
  speed = 1.0,
  voice = 'natural',
}: UseGeminiSpeechOptions = {}): UseGeminiSpeechReturn {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // 브라우저 TTS를 사용하여 실제 음성 출력
  const {
    speak: speakTTS,
    stop: stopTTS,
    isSpeaking: isTTSSpeaking,
    error: ttsError,
    setVoice,
    voices,
  } = useTextToSpeech({
    rate: speed,
    pitch: 1.1,
    volume: 1.0,
  });

  // 최적 음성 선택 (호러 무비 느낌 줄이기)
  useEffect(() => {
    if (voices.length > 0) {
      // 선호하는 음성 목록 (더 자연스러운 음성 우선)
      const preferredVoices = [
        'Google US English Female',
        'Google US English',
        'Microsoft Zira',
        'Samantha',
        'Karen',
      ];

      // 사용 가능한 음성 중에서 선호하는 음성 찾기
      let bestVoice = null;
      for (const preferred of preferredVoices) {
        const found = voices.find((v) => v.name.includes(preferred));
        if (found) {
          bestVoice = found;
          break;
        }
      }

      // 선호하는 음성이 없으면 'en-US' 지역의 여성 음성 찾기
      if (!bestVoice) {
        bestVoice = voices.find(
          (v) =>
            v.lang.includes('en-US') &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('microsoft') // Microsoft 기본 음성 제외
        );
      }

      // 적합한 음성이 있다면 설정
      if (bestVoice) {
        console.log('선택된 음성:', bestVoice.name);
        setVoice(bestVoice);
      }
    }
  }, [voices, setVoice]);

  // TTS 오류 처리
  useEffect(() => {
    if (ttsError) {
      setError(ttsError);
    }
  }, [ttsError]);

  // 전체 텍스트 SSML로 처리 (음성 품질 향상)
  const processTextWithSSML = (text: string): string => {
    // SSML 마크업 추가 - 더 자연스러운 음성을 위해
    const processedText = text
      // 숫자 뒤에 점이 있는 경우 서수로 처리 (예: "25." -> "25번째")
      .replace(/(\d+)\./g, '<say-as interpret-as="ordinal">$1</say-as>')
      // 특수 약어 처리
      .replace(/([A-Z]{2,})/g, '<say-as interpret-as="characters">$1</say-as>')
      // 자연스러운 쉼표 처리
      .replace(/,/g, '<break time="200ms"/>')
      // 마침표 처리
      .replace(/\./g, '<break time="400ms"/>');

    return processedText;
  };

  // Gemini API를 통해 텍스트 처리 후 음성 출력
  const speak = useCallback(
    async (text: string) => {
      if (!text || text.trim() === '') {
        setError('텍스트가 필요합니다.');
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);

        // Gemini API 호출
        const response = await fetch('/api/gemini-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice,
            speed,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gemini TTS 처리 실패');
        }

        const data = await response.json();

        // Gemini의 응답 텍스트가 있으면 TTS로 읽기
        if (data.geminiResponse) {
          // 전체 텍스트를 한 번에 처리 (끊김 방지)
          const processedText = processTextWithSSML(data.geminiResponse);
          await speakTTS(processedText);
        } else {
          // Gemini 응답이 없으면 원본 텍스트 읽기
          const processedText = processTextWithSSML(text);
          await speakTTS(processedText);
        }
      } catch (err) {
        console.error('Gemini 음성 재생 오류:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Gemini TTS 사용 중 오류가 발생했습니다.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [speakTTS, voice, speed]
  );

  // 음성 재생 중지
  const stop = useCallback(() => {
    stopTTS();
  }, [stopTTS]);

  return {
    speak,
    stop,
    isSpeaking: isProcessing || isTTSSpeaking,
    error,
  };
}

```

# lib/hooks/useSpeechRecognition.ts

```ts
import { useState, useEffect, useCallback } from 'react';
import {
  SpeechRecognition,
  SpeechRecognitionEvent,
} from '../../types/speech-recognition';

// 음성 인식 옵션 인터페이스
interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  autoStop?: boolean; // 사용자가 말을 멈추면 자동으로 인식 중지
  silenceTimeout?: number; // 침묵 감지 시간 (ms)
}

// 음성 인식 훅 반환 값 인터페이스
interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  hasRecognitionSupport: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSpeaking: boolean; // 사용자가 현재 말하고 있는지 여부
  confidence: number; // 마지막 인식 결과의 신뢰도 (0-1)
}

// SpeechRecognition 확장 타입 (maxAlternatives 속성 포함)
interface ExtendedSpeechRecognition extends SpeechRecognition {
  maxAlternatives?: number;
}

/**
 * 음성 인식 기능을 위한 커스텀 훅
 * @param options 음성 인식 옵션
 * @returns 음성 인식 상태 및 제어 함수
 */
export function useSpeechRecognition({
  language = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 3,
  autoStop = true,
  silenceTimeout = 1500,
}: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [recognitionInstance, setRecognitionInstance] =
    useState<ExtendedSpeechRecognition | null>(null);

  // 자동 중지를 위한 타이머 참조
  const silenceTimerRef = useState<NodeJS.Timeout | null>(null);

  // 브라우저 지원 여부 확인
  const hasRecognitionSupport =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // 침묵 감지 로직
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef[0]) {
      clearTimeout(silenceTimerRef[0]);
      silenceTimerRef[0] = null;
    }

    if (autoStop && isListening) {
      silenceTimerRef[0] = setTimeout(() => {
        if (recognitionInstance && isListening) {
          recognitionInstance.stop();
        }
      }, silenceTimeout);
    }
  }, [
    autoStop,
    isListening,
    recognitionInstance,
    silenceTimeout,
    silenceTimerRef,
  ]);

  // 초기화 - 인식 인스턴스 생성 및 이벤트 핸들러 설정
  useEffect(() => {
    if (!hasRecognitionSupport) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition() as ExtendedSpeechRecognition;

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    if ('maxAlternatives' in recognition) {
      recognition.maxAlternatives = maxAlternatives;
    }

    recognition.lang = language;

    // 음성 인식 결과 처리
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      // 말하고 있음 상태 설정
      setIsSpeaking(true);

      // 자동 중지 타이머 재설정
      resetSilenceTimer();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        // 가장 높은 신뢰도 추적
        if (result[0].confidence > bestConfidence) {
          bestConfidence = result[0].confidence;
          setConfidence(bestConfidence);
        }

        // 더 정확한 결과를 위해 여러 대안 중에서 최상의 결과 선택
        let bestAlternative = result[0];
        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > bestAlternative.confidence) {
            bestAlternative = result[j];
          }
        }

        const transcript = bestAlternative.transcript;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      } else if (interimTranscript) {
        // 임시 결과가 있는 경우만 업데이트 (깜빡임 방지)
        setTranscript((prev) => {
          // 이전 결과와 실질적으로 다른 경우에만 업데이트
          if (
            interimTranscript.trim() &&
            (prev.trim() === '' || interimTranscript.length > prev.length * 0.5)
          ) {
            return interimTranscript;
          }
          return prev;
        });
      }
    };

    // 오디오 감지 이벤트 - 말하기 시작
    recognition.onaudiostart = () => {
      setIsSpeaking(true);
      resetSilenceTimer();
    };

    // 오디오 종료 이벤트 - 말하기 중지
    recognition.onaudioend = () => {
      setIsSpeaking(false);
    };

    // 음성 인식 오류 처리
    recognition.onerror = (event: Event) => {
      const errorEvent = event as { error?: string };

      // 'no-speech' 오류는 정보 제공용으로만 처리 (오류로 표시하지 않음)
      if (errorEvent.error === 'no-speech') {
        setIsSpeaking(false);
        return;
      }

      setError(`Speech recognition error: ${errorEvent.error || 'unknown'}`);
      setIsListening(false);
      setIsSpeaking(false);
    };

    // 음성 인식 종료 처리
    recognition.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);

      // 타이머 정리
      if (silenceTimerRef[0]) {
        clearTimeout(silenceTimerRef[0]);
        silenceTimerRef[0] = null;
      }
    };

    setRecognitionInstance(recognition);

    // isListening 참조를 사용하지 않는 방식으로 클린업 함수 변경
    return () => {
      if (recognition) {
        // 이벤트 핸들러 제거
        recognition.onresult = null;
        recognition.onaudiostart = null;
        recognition.onaudioend = null;
        recognition.onerror = null;
        recognition.onend = null;
        
        // 클린업 함수에서 stop() 호출을 제거
        // 무한 루프 방지를 위해 현재 isListening을 참조하지 않음
      }

      if (silenceTimerRef[0]) {
        clearTimeout(silenceTimerRef[0]);
        silenceTimerRef[0] = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    continuous, 
    interimResults,
    language,
    maxAlternatives,
    hasRecognitionSupport,
    resetSilenceTimer,
    silenceTimerRef,
  ]);
  
  // 별도의 useEffect로 분리하여 isListening 상태가 변경될 때만 처리
  useEffect(() => {
    // 인식 인스턴스가 없으면 아무것도 하지 않음
    if (!recognitionInstance) return;
    
    // isListening이 true지만 인식이 시작되지 않았을 경우 시작
    if (isListening) {
      try {
        // 이미 시작된 상태에서 다시 start()를 호출하면 에러가 발생할 수 있으므로 조심해야 함
        // 여기에서는 별도의 상태로 추적하지 않고 try-catch로 처리
        recognitionInstance.start();
      } catch (error) {
        // 이미 실행 중인 경우의 에러는 무시 (DOMException: SpeechRecognition has already been started.)
        console.log('Recognition already started or other error');
      }
    } else {
      // isListening이 false일 때 인식 중지
      try {
        recognitionInstance.stop();
      } catch (error) {
        // 이미 중지된 경우의 에러는 무시
        console.log('Recognition not running or other error');
      }
    }
    
  }, [isListening, recognitionInstance]);

  // 듣기 시작
  const startListening = useCallback(() => {
    if (!recognitionInstance) return;

    setError(null);
    setIsListening(true);
    setIsSpeaking(false);
    setConfidence(0);

    try {
      recognitionInstance.start();
      resetSilenceTimer();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setError(`Error starting speech recognition: ${errorMessage}`);
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [recognitionInstance, resetSilenceTimer]);

  // 듣기 중지
  const stopListening = useCallback(() => {
    if (!recognitionInstance) return;

    if (silenceTimerRef[0]) {
      clearTimeout(silenceTimerRef[0]);
      silenceTimerRef[0] = null;
    }

    recognitionInstance.stop();
    setIsListening(false);
    setIsSpeaking(false);
  }, [recognitionInstance, silenceTimerRef]);

  // 기록 초기화
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  return {
    transcript,
    isListening,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSpeaking,
    confidence,
  };
}

```

# lib/hooks/useTextToSpeech.ts

```ts
import { useState, useEffect, useCallback } from 'react';

// SpeechSynthesis 인터페이스 (Web Speech API)
interface SpeechSynthesisVoice {
  default: boolean;
  lang: string;
  localService: boolean;
  name: string;
  voiceURI: string;
}

// TTS 옵션 인터페이스
interface TextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// 훅 반환 값 인터페이스
interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  hasTtsSupport: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  error: string | null;
}

/**
 * 텍스트를 음성으로 변환하는 커스텀 훅
 * @param options TTS 옵션 (언어, 속도, 음조, 볼륨)
 * @returns TTS 상태 및 제어 함수
 */
export function useTextToSpeech({
  lang = 'en-US',
  rate = 1,
  pitch = 1,
  volume = 1,
}: TextToSpeechOptions = {}): UseTextToSpeechReturn {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRate, setCurrentRate] = useState<number>(rate);
  const [currentPitch, setCurrentPitch] = useState<number>(pitch);
  const [currentVolume, setCurrentVolume] = useState<number>(volume);

  // 브라우저 지원 여부 확인
  const hasTtsSupport =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // 음성 목록 불러오기
  useEffect(() => {
    if (!hasTtsSupport) return;

    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // 기본 음성 선택 (지정된 언어에 맞는 음성 중 첫 번째)
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice =
          availableVoices.find((voice) => voice.lang.includes(lang)) ||
          availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    // 음성 목록 초기화
    handleVoicesChanged();

    // 음성 목록 변경 이벤트 리스너
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [hasTtsSupport, lang, selectedVoice]);

  // 음성 재생
  const speak = useCallback(
    (text: string) => {
      if (!hasTtsSupport) {
        setError('브라우저가 TTS 기능을 지원하지 않습니다.');
        return;
      }

      try {
        // 이전 음성 재생 중이면 중지
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // 음성 설정
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.lang = lang;
        utterance.rate = currentRate;
        utterance.pitch = currentPitch;
        utterance.volume = currentVolume;

        // 상태 이벤트 처리
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };

        utterance.onerror = (event) => {
          setError(`TTS 오류: ${event.error}`);
          setIsSpeaking(false);
        };

        // 음성 재생
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        setError('TTS 재생 중 오류가 발생했습니다.');
        setIsSpeaking(false);
      }
    },
    [
      hasTtsSupport,
      selectedVoice,
      lang,
      currentRate,
      currentPitch,
      currentVolume,
    ]
  );

  // 음성 중지
  const stop = useCallback(() => {
    if (!hasTtsSupport) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [hasTtsSupport]);

  // 음성 일시 정지
  const pause = useCallback(() => {
    if (!hasTtsSupport || !isSpeaking) return;

    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [hasTtsSupport, isSpeaking]);

  // 음성 재개
  const resume = useCallback(() => {
    if (!hasTtsSupport || !isPaused) return;

    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [hasTtsSupport, isPaused]);

  // 음성 선택
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  // 속도 설정
  const setRate = useCallback((newRate: number) => {
    setCurrentRate(newRate);
  }, []);

  // 음조 설정
  const setPitch = useCallback((newPitch: number) => {
    setCurrentPitch(newPitch);
  }, []);

  // 볼륨 설정
  const setVolume = useCallback((newVolume: number) => {
    setCurrentVolume(newVolume);
  }, []);

  // 컴포넌트 해제 시 음성 중지
  useEffect(() => {
    return () => {
      if (hasTtsSupport && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [hasTtsSupport, isSpeaking]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    hasTtsSupport,
    voices,
    setVoice,
    selectedVoice,
    setRate,
    setPitch,
    setVolume,
    error,
  };
}

```

# lib/hooks/useUnrealSpeech.ts

```ts
import { useState, useCallback, useRef } from 'react';

interface UseUnrealSpeechOptions {
  apiKey?: string;
  voice?: string;
  bitrate?: string;
  speed?: number;
  pitch?: number;
}

interface UseUnrealSpeechReturn {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  error: string | null;
  stop: () => void;
}

/**
 * UnrealSpeech API를 사용하여 고품질 TTS를 제공하는 훅
 * @param options TTS 옵션 (apiKey, voice, bitrate, speed, pitch)
 * @returns TTS 상태 및 제어 함수
 */
export function useUnrealSpeech({
  apiKey,
  voice = 'Jasper',
  bitrate = '128k',
  speed = -0.2,
  pitch = 1.0,
}: UseUnrealSpeechOptions = {}): UseUnrealSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<{ text: string; resolve: () => void }[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  // API 키가 없을 경우 환경변수 사용
  const effectiveApiKey =
    apiKey || process.env.NEXT_PUBLIC_UNREALSPEECH_API_KEY;

  // 텍스트 전처리 (음성 품질 향상)
  const processText = (text: string): string => {
    return (
      text
        // 약어처리 (API, NASA 등 대문자 약어를 개별 문자로 발음)
        .replace(/([A-Z]{2,})/g, (match) => match.split('').join(' '))
        // 숫자 처리 (123th -> 123rd, 2nd 등 서수로 자연스럽게 읽기)
        .replace(/(\d+)(st|nd|rd|th)\b/g, '$1 $2')
        // 특수문자 공백 추가
        .replace(/([.,;:!?])/g, '$1 ')
        // 연속된 공백 제거
        .replace(/\s+/g, ' ')
        .trim()
    );
  };

  // 오디오 재생 중지 함수
  const stop = useCallback(() => {
    // 재생 큐 초기화
    audioQueueRef.current = [];
    isProcessingRef.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }

    // AudioContext가 있으면 일시 중지
    if (
      audioContextRef.current &&
      audioContextRef.current.state === 'running'
    ) {
      audioContextRef.current.suspend().catch(console.error);
    }
  }, []);

  // 음성 큐 처리 함수
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const { text, resolve } = audioQueueRef.current.shift()!;

    try {
      // UnrealSpeech API V8 호출
      const response = await fetch('https://api.v8.unrealspeech.com/stream', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Text: text,
          VoiceId: voice,
          Bitrate: bitrate,
          Speed: speed,
          Pitch: pitch,
          AudioFormat: 'mp3',
          SampleRate: 24000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }

      // 응답에서 오디오 데이터를 가져옴
      const arrayBuffer = await response.arrayBuffer();

      // AudioContext 재생 방식으로 변경 (자동 재생 정책을 더 잘 준수)
      if (typeof window !== 'undefined') {
        try {
          // 기존 AudioContext가 있으면 닫기
          if (audioContextRef.current) {
            await audioContextRef.current.close().catch(() => {});
          }

          // 새 AudioContext 생성
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;

          // 버퍼 디코딩
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // 소스 생성 및 연결
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);

          // 이벤트 핸들러 등록
          source.onended = () => {
            resolve(); // 현재 텍스트 재생 완료
            isProcessingRef.current = false;

            // 다음 항목 처리
            if (audioQueueRef.current.length > 0) {
              setTimeout(() => processQueue(), 100); // 약간의 간격을 두고 다음 항목 처리
            } else {
              setIsSpeaking(false);
            }
          };

          // 재생 시작
          setIsSpeaking(true);
          source.start(0);

          // 추가 이벤트 및 참조 정리
          audioContext.onstatechange = () => {
            if (audioContext.state === 'suspended') {
              isProcessingRef.current = false;
              setIsSpeaking(false);
            }
          };
        } catch (audioError) {
          console.error('오디오 처리 오류:', audioError);
          setError('오디오를 처리하는 중 오류가 발생했습니다.');
          isProcessingRef.current = false;
          setIsSpeaking(false);
          resolve(); // 오류가 있어도 이 항목 처리 완료로 표시

          // 다음 항목 처리 시도
          if (audioQueueRef.current.length > 0) {
            setTimeout(() => processQueue(), 100);
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`TTS 오류: ${errorMessage}`);
      isProcessingRef.current = false;
      setIsSpeaking(false);
      resolve(); // 오류가 있어도 이 항목 처리 완료로 표시

      // 다음 항목 처리 시도
      if (audioQueueRef.current.length > 0) {
        setTimeout(() => processQueue(), 100);
      }
    }
  }, [effectiveApiKey, voice, bitrate, speed, pitch]);

  const speak = useCallback(
    async (text: string) => {
      // 공백이거나 짧은 텍스트는 중지 명령으로 처리
      if (!text || text.trim().length <= 1) {
        stop();
        return;
      }

      if (!effectiveApiKey) {
        setError('UnrealSpeech API 키가 필요합니다.');
        return;
      }

      try {
        // 텍스트 전처리
        const processedText = processText(text);

        // 텍스트를 더 작은 단위로 분할하지 않고 전체 텍스트를 한 번에 처리
        // 이렇게 하면 UnrealSpeech API가 자연스러운 흐름으로 전체 텍스트를 합성할 수 있음
        return new Promise<void>((resolve) => {
          // 큐에 추가
          audioQueueRef.current.push({ text: processedText, resolve });

          // 큐 처리 시작 (이미 처리 중이 아닌 경우)
          if (!isProcessingRef.current) {
            processQueue();
          }
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.';
        setError(`TTS 오류: ${errorMessage}`);
        setIsSpeaking(false);
      }
    },
    [effectiveApiKey, processQueue, stop]
  );

  return {
    speak,
    isSpeaking,
    error,
    stop,
  };
}

// 타입 정의 추가
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

```

# lib/services/gemini-service.ts

```ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// 응답 인터페이스 정의
export interface GeminiResponse {
  context?: string;
  nativeExpressions?: string[];
  sampleConversation?: string;
  error?: string;
}

// 요청 옵션 인터페이스
export interface GeminiRequestOptions {
  sentence: string;
  nativeSentence?: string;
}

/**
 * Gemini API를 사용하여 문장 맥락, 네이티브 표현, 샘플 대화를 생성
 * @param options 요청 옵션
 * @returns 생성된 내용 또는 오류
 */
export async function generatePodcastContent({
  sentence,
  nativeSentence,
}: GeminiRequestOptions): Promise<GeminiResponse> {
  if (!sentence) {
    return { error: '문장이 필요합니다.' };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // Google Generative AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // Gemini Pro 모델 사용
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
    });

    // 프롬프트 생성 - 언어는 항상 영어로 고정
    const nativeInfo = nativeSentence
      ? `\nEnglish sentence: ${sentence}\nMeaning in Korean: ${nativeSentence}`
      : `\nEnglish sentence: ${sentence}`;

    const prompt = `Create detailed information for the following English sentence in JSON format:${nativeInfo}

Please provide information divided into three parts:
1. context: Brief explanation of the situation where this sentence can be used (in English)
2. nativeExpressions: 3-5 alternative expressions that native English speakers would use more naturally
3. sampleConversation: A short conversation example between 2-3 people that includes this expression (in English)

Provide your response in the following JSON format:
{
  "context": "Explanation of when this sentence is used",
  "nativeExpressions": ["Expression 1", "Expression 2", "Expression 3"],
  "sampleConversation": "A: Conversation\\nB: Conversation\\nA: Conversation"
}

Return only the JSON format without any additional explanations or text.`;

    // API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.slice(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);

      return {
        context: parsed.context,
        nativeExpressions: parsed.nativeExpressions,
        sampleConversation: parsed.sampleConversation,
      };
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return {
        error: 'API 응답을 파싱하는 중 오류가 발생했습니다.',
        context: text, // 파싱 실패 시 원본 텍스트 반환
      };
    }
  } catch (error) {
    console.error('Gemini 서비스 오류:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Gemini 서비스 사용 중 알 수 없는 오류가 발생했습니다.',
    };
  }
}

```

# lib/services/gemini-tts-service.ts

```ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiTTSOptions {
  text: string;
  voice?: string;
  speed?: number;
}

export interface GeminiTTSResponse {
  audioUrl: string;
  geminiResponse?: string;
  error?: string;
}

/**
 * Gemini-2.0-flash-lite 모델을 사용하여 텍스트를 음성으로 변환
 * TTS 모델은 아니지만, 응답을 오디오로 생성하는 방식으로 사용
 */
export async function generateGeminiAudio({
  text,
  voice = 'natural',
  speed = 1.0,
}: GeminiTTSOptions): Promise<GeminiTTSResponse> {
  if (!text || text.trim() === '') {
    return { audioUrl: '', error: '텍스트가 필요합니다.' };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API 키가 없습니다. 환경 변수를 확인해주세요.');
    }

    // Google Generative AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // Gemini-2.0-flash-lite 모델 사용
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
    });

    // Gemini에게 음성 나레이션 스크립트 생성 요청
    const prompt = `Please read the following text with a natural, engaging voice. 
Read it as if you are a professional podcaster or audiobook narrator.
Speak clearly, with proper pacing and intonation:

${text}

Adjust reading pace: ${
      speed === 1.0 ? 'normal' : speed < 1.0 ? 'slower' : 'faster'
    }
Voice style: ${voice || 'natural'}`;

    // API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // 실제로는 음성 파일을 생성할 수 없지만,
    // 텍스트를 웹 브라우저 TTS로 읽게 할 수 있음
    return {
      audioUrl: '', // 실제 오디오 URL을 생성할 수 없으므로 빈 값 반환
      geminiResponse: generatedText, // Gemini의 응답 반환
    };
  } catch (error) {
    console.error('Gemini TTS 서비스 오류:', error);
    return {
      audioUrl: '',
      error:
        error instanceof Error
          ? error.message
          : 'Gemini TTS 서비스 사용 중 알 수 없는 오류가 발생했습니다.',
    };
  }
}

```

# lib/services/speech-recognition-service.ts

```ts
/**
 * 음성인식(Speech Recognition) API 서비스
 */

import {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionConstructor,
} from '../../types/speech-recognition';

// 음성인식 결과 인터페이스
export interface SpeechRecognitionResult {
  transcript: string;
  confidence?: number;
  isFinal: boolean;
}

// 음성인식 이벤트 리스너 타입
export type SpeechRecognitionEventListener = (
  result: SpeechRecognitionResult
) => void;

// 사용 가능한 브라우저 음성인식 API 가져오기
const BrowserSpeechRecognition: SpeechRecognitionConstructor | undefined =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

/**
 * 브라우저의 음성인식 기능을 사용할 수 있는지 확인
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!BrowserSpeechRecognition;
}

/**
 * 클라이언트측 음성인식 서비스 클래스
 */
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: SpeechRecognitionEventListener | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  /**
   * 서비스 초기화
   * @param options 음성인식 옵션
   */
  constructor(
    private options: {
      lang?: string;
      continuous?: boolean;
      interimResults?: boolean;
    } = {}
  ) {
    if (typeof window !== 'undefined' && BrowserSpeechRecognition) {
      this.initRecognition();
    }
  }

  /**
   * 음성인식 객체 초기화
   */
  private initRecognition(): void {
    if (!BrowserSpeechRecognition) {
      console.error('Speech recognition is not supported in this browser');
      return;
    }

    this.recognition = new BrowserSpeechRecognition();
    this.recognition.lang = this.options.lang || 'en-US';
    this.recognition.continuous = this.options.continuous ?? true;
    this.recognition.interimResults = this.options.interimResults ?? true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!this.onResultCallback) return;

      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      const confidence = lastResult[0].confidence;
      const isFinal = lastResult.isFinal;

      this.onResultCallback({
        transcript,
        confidence,
        isFinal,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error || 'Unknown speech recognition error');
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * 음성 인식 시작
   */
  start(): void {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        if (this.onErrorCallback) {
          this.onErrorCallback('Speech recognition is not supported');
        }
        return;
      }
    }

    if (this.isListening) {
      this.stop();
    }

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Failed to start speech recognition');
      }
      console.error('Speech recognition start error:', error);
    }
  }

  /**
   * 음성 인식 중지
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('Speech recognition stop error:', error);
      }
    }
  }

  /**
   * 음성 인식 취소
   */
  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
        this.isListening = false;
      } catch (error) {
        console.error('Speech recognition abort error:', error);
      }
    }
  }

  /**
   * 음성 인식 결과 이벤트 리스너 설정
   */
  onResult(callback: SpeechRecognitionEventListener): void {
    this.onResultCallback = callback;
  }

  /**
   * 오류 이벤트 리스너 설정
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * 종료 이벤트 리스너 설정
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * 현재 듣고 있는지 상태 반환
   */
  isRecognizing(): boolean {
    return this.isListening;
  }
}

/**
 * 서버 기반 음성인식 API 호출 (Google Speech-to-Text 등 외부 API 사용 시)
 * @param audioBlob 오디오 데이터
 * @param options 옵션
 * @returns 변환된 텍스트 결과
 */
export async function recognizeSpeech(
  audioBlob: Blob,
  options: { lang?: string } = {}
): Promise<{ transcript?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    if (options.lang) {
      formData.append('lang', options.lang);
    }

    const response = await fetch('/api/speech-recognition', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Speech recognition request failed');
    }

    const data = await response.json();
    return { transcript: data.transcript };
  } catch (error) {
    console.error('Speech recognition API error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error in speech recognition',
    };
  }
}

```

# lib/services/tts-service.ts

```ts
/**
 * Text-to-Speech API 서비스
 */

// API 요청 옵션 인터페이스
interface TTSRequestOptions {
  text: string;
  lang?: string;
  voice?: string;
  speed?: number;
}

// TTS 응답 인터페이스
interface TTSResponse {
  audioUrl?: string;
  error?: string;
}

/**
 * 텍스트를 오디오로 변환하는 API 호출
 * @param options TTS 요청 옵션
 * @returns 오디오 URL 또는 오류
 */
export async function textToSpeech({
  text,
  lang = 'en-US',
  voice = 'en-US-Standard-A',
  speed = -0.2,
}: TTSRequestOptions): Promise<TTSResponse> {
  if (!text) {
    return { error: 'Text is required' };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_TTS_API_KEY;

    if (!apiKey) {
      throw new Error(
        'TTS API key is missing. Please check your environment variables.'
      );
    }

    // 외부 TTS API 호출
    // 실제 API 엔드포인트와 파라미터는 사용하는 서비스에 따라 변경 필요
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        lang,
        voice,
        speed,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'TTS API request failed');
    }

    const data = await response.json();
    return { audioUrl: data.audioUrl };
  } catch (error) {
    console.error('TTS service error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred with the TTS service',
    };
  }
}

/**
 * 브라우저의 기본 Web Speech API를 사용하여 텍스트를 음성으로 변환
 * (API 호출 없이 클라이언트 측에서 작동)
 * @param text 읽을 텍스트
 * @param options 음성 옵션
 * @returns 성공 여부
 */
export function speakText(
  text: string,
  options: { lang?: string; rate?: number; pitch?: number; voice?: string } = {}
): boolean {
  if (!window.speechSynthesis) {
    console.error('Browser does not support speech synthesis');
    return false;
  }

  try {
    // 기존 음성 중지
    window.speechSynthesis.cancel();

    // 새 음성 생성
    const utterance = new SpeechSynthesisUtterance(text);

    // 옵션 설정
    if (options.lang) utterance.lang = options.lang;
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;

    // 음성 선택
    if (options.voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === options.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    // 음성 재생
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return false;
  }
}

/**
 * 로컬 TTS 서비스를 사용할지 또는 API를 호출할지 결정하는 함수
 * @param text 음성으로 변환할 텍스트
 * @param options 옵션
 * @returns 성공 여부 또는 오디오 URL
 */
export async function speakWithFallback(
  text: string,
  options: {
    useApi?: boolean;
    lang?: string;
    rate?: number;
    pitch?: number;
    voice?: string;
  } = {}
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  // API 사용 옵션이 있거나 브라우저가 음성 합성을 지원하지 않는 경우 API 사용
  if (options.useApi || !window.speechSynthesis) {
    const response = await textToSpeech({
      text,
      lang: options.lang,
      voice: options.voice,
      speed: options.rate,
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, audioUrl: response.audioUrl };
  }

  // 브라우저의 기본 음성 합성 사용
  const success = speakText(text, options);
  return { success };
}

```

# lib/supabase/api.ts

```ts
import { createClient } from './client';
import { Database } from '@/types/supabase';
import { Category, Subcategory, Flashcard } from '@/types/card';

// 카테고리(대분류 폴더) 관련 함수
export const getCategories = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data;
};

export const getCategoryById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    throw error;
  }

  return data;
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
};

export const deleteCategory = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }

  return true;
};

// 서브카테고리(중분류 폴더) 관련 함수
export const getSubcategories = async (categoryId?: string) => {
  const supabase = createClient();
  
  let query = supabase
    .from('subcategories')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }

  return data;
};

export const getSubcategoryById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching subcategory:', error);
    throw error;
  }

  return data;
};

export const createSubcategory = async (subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const { data, error } = await supabase
    .from('subcategories')
    .insert({
      ...subcategory,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }

  return data;
};

export const updateSubcategory = async (id: string, subcategory: Partial<Subcategory>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subcategories')
    .update(subcategory)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }

  return data;
};

export const deleteSubcategory = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }

  return true;
};

// 플래시카드 관련 함수
export const getFlashcards = async (subcategoryId?: string) => {
  const supabase = createClient();
  
  let query = supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching flashcards:', error);
    throw error;
  }

  return data;
};

export const getFlashcardById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching flashcard:', error);
    throw error;
  }

  return data;
};

export const createFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      ...flashcard,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }

  return data;
};

export const updateFlashcard = async (id: string, flashcard: Partial<Flashcard>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('flashcards')
    .update(flashcard)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating flashcard:', error);
    throw error;
  }

  return data;
};

export const deleteFlashcard = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }

  return true;
};

// CSV 데이터를 플래시카드로 일괄 생성하는 함수
export const createFlashcardsFromCSV = async (
  subcategoryId: string, 
  flashcards: Array<{ native_text: string; foreign_text: string; }>
) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 모든 카드에 subcategory_id와 user_id 추가
  const cardsWithIds = flashcards.map(card => ({
    ...card,
    subcategory_id: subcategoryId,
    user_id: user.id
  }));
  
  const { data, error } = await supabase
    .from('flashcards')
    .insert(cardsWithIds)
    .select();

  if (error) {
    console.error('Error bulk creating flashcards:', error);
    throw error;
  }

  return data;
};

// 사용자 학습 진행 상황 관련 함수
export const getUserProgress = async (flashcardId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 결과가 없는 경우
    console.error('Error fetching user progress:', error);
    throw error;
  }

  return data;
};

export const updateUserProgress = async (
  flashcardId: string, 
  progress: { stage: number; status: string; }
) => {
  const supabase = createClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 기존 데이터 확인
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('flashcard_id', flashcardId)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (existingProgress) {
    // 기존 데이터 업데이트
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        ...progress,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProgress.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
    
    return data;
  } else {
    // 새 데이터 생성
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        flashcard_id: flashcardId,
        ...progress,
        last_reviewed_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user progress:', error);
      throw error;
    }
    
    return data;
  }
};

```

# lib/supabase/client.ts

```ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
export const createClient = () => 
  createClientComponentClient<Database>();

```

# lib/supabase/server.ts

```ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// 서버 컴포넌트에서 사용하는 Supabase 클라이언트
export async function createClient() {
  return createServerComponentClient<Database>({
    cookies
  });
}

```

# lib/utils/cn.ts

```ts
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

```

# lib/utils/csv-parser.ts

```ts
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

```

# lib/utils/text-similarity.ts

```ts
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

  // 정규화 후 완전히 동일하면 바로 true
  if (normalizedInput === normalizedCorrect) return true;

  // 유사도 계산 (정규화된 텍스트 기준)
  const similarity = calculateSimilarity(normalizedInput, normalizedCorrect);
  return similarity >= threshold;
}

```

# middleware.ts

```ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

// 보호되어야 하는 경로들
const protectedRoutes = [
  // 필요에 따라 보호가 필요한 경로 추가
  // '/learn/settings',
  // '/admin',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // next.js 15에서는 req, res를 전달하여 미들웨어 클라이언트 생성
  // 미들웨어에서는 cookies()를 사용하지 않으므로 변경 불필요
  const supabase = createMiddlewareClient<Database>({ req, res });

  // 세션 새로고침
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 현재 경로
  const path = req.nextUrl.pathname;

  // 보호된 경로에 접근할 때 인증 확인
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    // 로그인 페이지로 리디렉션하되, 원래 가려던 URL을 쿼리 파라미터로 포함
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근할 경우
  if ((path === '/auth/login' || path === '/auth/signup') && session) {
    // 대시보드나 홈으로 리디렉션
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // 이 경로들에 미들웨어가 적용됩니다
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)',
  ],
};

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

# next.config.ts

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_DISABLE_TURBO: 'true', // Turbopack 비활성화
  },
};

export default nextConfig;

```

# package.json

```json
{
  "name": "nextjs-language-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "NEXT_DISABLE_TURBO=1 next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@google/generative-ai": "^0.2.1",
    "@playwright/test": "^1.52.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.49.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "next": "15.3.1",
    "next-themes": "^0.4.6",
    "openai": "^4.95.1",
    "postcss": "^8.5.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.2.0",
    "unrealspeech": "^1.8.6"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4.1.4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.3.1",
    "tailwindcss": "^4.1.4",
    "typescript": "^5"
  }
}

```

# postcss.config.mjs

```mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

```

# public/file.svg

This is a file of the type: SVG Image

# public/globe.svg

This is a file of the type: SVG Image

# public/next.svg

This is a file of the type: SVG Image

# public/vercel.svg

This is a file of the type: SVG Image

# public/window.svg

This is a file of the type: SVG Image

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# supabase-schema.sql

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table (대분류 폴더)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table (중분류 폴더)
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  native_text TEXT NOT NULL,
  foreign_text TEXT NOT NULL,
  pronunciation TEXT,
  notes TEXT,
  difficulty_level SMALLINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  stage SMALLINT NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, flashcard_id)
);

-- Profiles table for additional user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  native_language VARCHAR(50) DEFAULT 'ko',
  learning_language VARCHAR(50) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Setup Row Level Security (RLS)
-- Categories: everyone can view, only authenticated users can create/update/delete
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT USING (true);
  
CREATE POLICY "Categories can be created by authenticated users" 
  ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Categories can be updated by authenticated users" 
  ON categories FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Categories can be deleted by authenticated users" 
  ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Subcategories: similar to categories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories are viewable by everyone" 
  ON subcategories FOR SELECT USING (true);
  
CREATE POLICY "Subcategories can be created by authenticated users" 
  ON subcategories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Subcategories can be updated by authenticated users" 
  ON subcategories FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Subcategories can be deleted by authenticated users" 
  ON subcategories FOR DELETE USING (auth.role() = 'authenticated');

-- Flashcards: similar to categories
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flashcards are viewable by everyone" 
  ON flashcards FOR SELECT USING (true);
  
CREATE POLICY "Flashcards can be created by authenticated users" 
  ON flashcards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Flashcards can be updated by authenticated users" 
  ON flashcards FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Flashcards can be deleted by authenticated users" 
  ON flashcards FOR DELETE USING (auth.role() = 'authenticated');

-- User Progress: users can only see and modify their own progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" 
  ON user_progress FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own progress" 
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own progress" 
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own progress" 
  ON user_progress FOR DELETE USING (auth.uid() = user_id);

-- Profiles: users can only see their own profile and update it
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can create their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# types/card.ts

```ts
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

```

# types/message.ts

```ts
export const SENDER = {
  USER: 'user',
  AI: 'ai',
} as const;

export type SenderType = (typeof SENDER)[keyof typeof SENDER];

export interface Message {
  sender: SenderType;
  text: string;
}

```

# types/speech-recognition.ts

```ts
export interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// SpeechRecognition 생성자 타입
export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// 브라우저에 global SpeechRecognition 타입 선언
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

```

# types/stages.ts

```ts
export const STAGES = {
  LOAD: 'load',
  STAGE1: 'stage1',
  STAGE2: 'stage2',
  STAGE3: 'stage3',
  STAGE4: 'stage4',
} as const;

export type StageType = (typeof STAGES)[keyof typeof STAGES];

```

# types/supabase.ts

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcards: {
        Row: {
          id: string
          subcategory_id: string
          native_text: string
          foreign_text: string
          pronunciation: string | null
          notes: string | null
          difficulty_level: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subcategory_id: string
          native_text: string
          foreign_text: string
          pronunciation?: string | null
          notes?: string | null
          difficulty_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subcategory_id?: string
          native_text?: string
          foreign_text?: string
          pronunciation?: string | null
          notes?: string | null
          difficulty_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subcategory_id_fkey"
            columns: ["subcategory_id"]
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          flashcard_id: string
          stage: number
          status: string
          last_reviewed_at: string | null
          next_review_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          flashcard_id: string
          stage: number
          status: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          flashcard_id?: string
          stage?: number
          status?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

```

