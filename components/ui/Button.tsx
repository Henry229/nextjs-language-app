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
