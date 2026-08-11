import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { GROQ_API_KEY } from '../constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function chatWithAI(message: string) {
  // استخدم واجهة API الحالية للتواصل مع الذكاء الاصطناعي
  const response = await fetch('https://api.groq.co/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({ message })
  })
  const data = await response.json()
  return data.response
}