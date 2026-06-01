'use client';

import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  rightContent?: ReactNode;
  className?: string;
}

export default function Section({
  title,
  description,
  children,
  rightContent,
  className = '',
}: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">

        {/* Left */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>

          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Right */}
        {rightContent && (
          <div>
            {rightContent}
          </div>
        )}

      </div>

      {/* Content */}
      <div>
        {children}
      </div>

    </section>
  );
}