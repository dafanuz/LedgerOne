export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition =
  | 'top'
  | 'bottom'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  closable?: boolean
}
