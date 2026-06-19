'use client'

import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type CubeVariant = 'default' | 'inset' | 'floating' | 'selected'

interface CubeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CubeVariant
  as?: 'div' | 'article' | 'section' | 'aside'
}

const variantStyles: Record<CubeVariant, string> = {
  default:  'border-2 bg-[var(--color-concrete-bone)]',
  inset:    'border-2 bg-[var(--color-concrete-mid)]',
  floating: 'border-2 bg-[var(--color-concrete-bone)] translate-x-0.5 -translate-y-0.5',
  selected: 'border-2 bg-[var(--color-concrete-bone)]',
}

export function Cube({ variant = 'default', as: Tag = 'div', className, style, children, ...props }: CubeProps) {
  const borderColor = variant === 'selected'
    ? 'var(--color-lime)'
    : 'var(--color-concrete-char)'

  const outlineStyle = variant === 'selected'
    ? { outline: '2px solid var(--color-lime)', outlineOffset: '2px' }
    : {}

  return (
    <Tag
      className={cn(variantStyles[variant], className)}
      style={{ borderColor, ...outlineStyle, ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
}
