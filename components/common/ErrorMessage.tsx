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
