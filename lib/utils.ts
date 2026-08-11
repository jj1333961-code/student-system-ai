import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function chatWithAI(message: string) {
  // استخدم واجهة API الحالية للتواصل مع الذكاء الاصطناعي
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  })
  const data = await response.json()
  return data.response
}