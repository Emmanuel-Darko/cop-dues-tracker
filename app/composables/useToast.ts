export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

export const useToast = () => {
  const toasts = useState<Toast[]>('app-toasts', () => [])
  let id = 0

  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const toast: Toast = { id: ++id, message, type }
    toasts.value = [...toasts.value, toast]
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== toast.id)
    }, duration)
  }
  const success = (msg: string) => show(msg, 'success')
  const error = (msg: string) => show(msg, 'error', 5000)
  const info = (msg: string) => show(msg, 'info')
  return { toasts, show, success, error, info }
}
