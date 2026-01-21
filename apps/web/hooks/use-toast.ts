import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      style: {
        background: "#10B981",
        color: "white",
        border: "none"
      },
      className: "class-success"
    })
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      style: {
        background: "#EF4444",
        color: "white",
        border: "none"
      },
      className: "class-error"
    })
  },
  info: (message: string) => {
    sonnerToast.info(message, {
      style: {
        background: "#3B82F6",
        color: "white",
        border: "none"
      },
      className: "class-info"
    })
  },
  warning: (message: string) => {
    sonnerToast.warning(message, {
      style: {
        background: "#F59E0B",
        color: "white",
        border: "none"
      },
      className: "class-warning"
    })
  },
}
