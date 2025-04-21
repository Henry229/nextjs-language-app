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
