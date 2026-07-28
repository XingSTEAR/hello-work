import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  title?: string
}

export function Dialog({ open, onClose, children, className, title }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative z-50 w-full max-w-lg max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl',
        'animate-in fade-in zoom-in-95 duration-200',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
