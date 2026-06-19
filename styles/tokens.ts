export const colors = {
  concrete: {
    bone:  '#f5f5f0',
    light: '#fafaf5',
    mid:   '#e8e6dd',
    gray:  '#6b7280',
    char:  '#1a1a1a',
    black: '#0a0a0a',
  },
  lime: {
    DEFAULT: '#c8da2b',
    ink:     '#5a6612',
  },
  box: {
    blue:   { DEFAULT: '#378ADD', ink: '#042C53', light: '#85B7EB' },
    orange: { DEFAULT: '#f4a261', ink: '#4a1b0c', light: '#FAC775' },
    green:  { DEFAULT: '#97C459', ink: '#173404', light: '#C0DD97' },
    yellow: { DEFAULT: '#f9c74f', ink: '#412402', light: '#FAC775' },
    red:    { DEFAULT: '#e63946', ink: '#501313', light: '#F09595' },
    pink:   { DEFAULT: '#ec4899', ink: '#4B1528', light: '#F4C0D1' },
    purple: { DEFAULT: '#5a4fcf', ink: '#26215C', light: '#AFA9EC' },
    teal:   { DEFAULT: '#2a9d8f', ink: '#04342C', light: '#5DCAA5' },
    coral:  { DEFAULT: '#e76f51', ink: '#4A1B0C', light: '#F0997B' },
  },
  status: {
    available: '#c8da2b',
    reserved:  '#e63946',
    blocked:   '#6b7280',
    pending:   '#f4a261',
  },
} as const

export type BoxColor = keyof typeof colors.box
export type StatusColor = keyof typeof colors.status

export const typography = {
  display: 'Space Grotesk',
  body:    'Inter',
  mono:    'JetBrains Mono',
} as const

export function boxColorHex(color: BoxColor): string {
  return colors.box[color].DEFAULT
}

export function statusColorHex(status: StatusColor): string {
  return colors.status[status]
}
