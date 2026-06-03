import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Función para combinar clases de Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
