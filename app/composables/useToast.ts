import { ref } from 'vue'

interface Toast {
  message: string
  color: string
  timeout: number
}

const show = ref(false)
const toast = ref<Toast>({
  message: '',
  color: 'success',
  timeout: 3000,
})

export function useToast() {
  function showToast(message: string, color: string = 'success', timeout: number = 3000) {
    toast.value = { message, color, timeout }
    show.value = true
  }

  function success(message: string) {
    showToast(message, 'success')
  }

  function error(message: string) {
    showToast(message, 'error', 5000)
  }

  function info(message: string) {
    showToast(message, 'info')
  }

  function warning(message: string) {
    showToast(message, 'warning')
  }

  return {
    show,
    toast,
    showToast,
    success,
    error,
    info,
    warning,
  }
}
