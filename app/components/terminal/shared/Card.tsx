'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  rightContent?: ReactNode;
  padding?: string;
}

export default function Card({
  children,
  className = '',
  title,
  description,
  rightContent,
  padding = 'p-5',
}: CardProps) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-white/15
        ${padding}
        ${className}
      `}
    >

      {/* Subtle Glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />

      {/* Header */}
      {(title || description || rightContent) && (
        <div className="relative z-10 flex items-start justify-between mb-5">

          <div>
            {title && (
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {title}
              </h3>
            )}

            {description && (
              <p className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>

          {rightContent && (
            <div>
              {rightContent}
            </div>
          )}

        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}