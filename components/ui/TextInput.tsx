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
