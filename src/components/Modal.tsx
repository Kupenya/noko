'use client'

export default function Modal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose }: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm?: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] bg-[#102d29]/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full sm:max-w-md rounded-t-[24px] sm:rounded-[4px] bg-[#fffdfa] p-6 sm:p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#a07955]">Wedding suite</p>
        <h3 className="mt-2 font-display text-4xl text-[#173f3b]">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-[#65706d]">{message}</p>
        <div className="mt-7 flex gap-3 justify-end">
          {onConfirm && <button type="button" className="min-h-[44px] px-5 rounded-full border border-[#173f3b]/15 text-sm text-[#173f3b] hover:bg-[#173f3b]/5" onClick={onClose}>Cancel</button>}
          <button type="button" className={`min-h-[44px] px-5 rounded-full text-sm font-bold tracking-wide text-white ${danger ? 'bg-red-700 hover:bg-red-800' : 'bg-[#173f3b] hover:bg-[#23554f]'}`} onClick={() => { onConfirm?.(); if (!onConfirm) onClose() }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
