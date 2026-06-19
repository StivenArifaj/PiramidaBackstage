'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  label: string
}

export function Pill({ active = false, label, className, ...props }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center px-5 py-1.5 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-150',
        'border-2 rounded-full cursor-pointer',
        active
          ? 'bg-[var(--color-lime)] border-[var(--color-lime-ink)] text-[var(--color-lime-ink)]'
          : 'bg-[var(--color-concrete-char)]/80 border-[var(--color-concrete-char)] text-[var(--color-concrete-bone)] hover:bg-[var(--color-lime)] hover:border-[var(--color-lime-ink)] hover:text-[var(--color-lime-ink)]',
        className
      )}
      style={{ fontFamily: 'var(--font-display)' }}
      {...props}
    >
      {label}
    </button>
  )
}
