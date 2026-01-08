
import { useRef } from 'react'
import { Toast } from './types'

export default function ToastItem({
  toast,
  onDismiss,
  theme,
}: {
  toast: Toast
  onDismiss: () => void
  theme: 'light' | 'dark'
}) {
  const startX = useRef<number | null>(null)

  const handleStart = (x: number) => (startX.current = x)
  const handleEnd = (x: number) => {
    if (startX.current && Math.abs(startX.current - x) > 80) {
      onDismiss()
    }
    startX.current = null
  }

  const base =
    'max-w-md mx-auto rounded-lg px-4 py-3 shadow-lg flex items-center justify-between gap-4 text-sm animate-slide-in cursor-pointer'

  const variants = {
    light: {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-slate-100 text-slate-800',
      warning: 'bg-yellow-100 text-yellow-800',
    },
    dark: {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-slate-800 text-white',
      warning: 'bg-yellow-600 text-white',
    },
  }

  return (
    <div
      role="alert"
      className={`${base} ${variants[theme][toast.type]}`}
      onMouseDown={e => handleStart(e.clientX)}
      onMouseUp={e => handleEnd(e.clientX)}
      onTouchStart={e => handleStart(e.touches[0].clientX)}
      onTouchEnd={e => handleEnd(e.changedTouches[0].clientX)}
    >
      <span>{toast.message}</span>

      {toast.closable && (
        <button
          onClick={onDismiss}
          className="ml-2 font-bold opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
