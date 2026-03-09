"use client";

import { Toaster, toast as sonnerToast } from "sonner";
import { CheckCircle, XCircle, Info, Loader2 } from "lucide-react";

// Toast helper functions
export function toastSuccess(message: string, description?: string) {
  sonnerToast.success(message, {
    description,
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    style: {
      background: "var(--background)",
      border: "2px solid #22c55e",
      color: "var(--foreground)",
    },
  });
}

export function toastError(message: string, description?: string) {
  sonnerToast.error(message, {
    description,
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    style: {
      background: "var(--background)",
      border: "2px solid #ef4444",
      color: "var(--foreground)",
    },
  });
}

export function toastInfo(message: string, description?: string) {
  sonnerToast.info(message, {
    description,
    icon: <Info className="w-4 h-4 text-blue-500" />,
    style: {
      background: "var(--background)",
      border: "2px solid #3b82f6",
      color: "var(--foreground)",
    },
  });
}

export function toastLoading(message: string, description?: string) {
  return sonnerToast.loading(message, {
    description,
    icon: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    style: {
      background: "var(--background)",
      border: "2px solid #3b82f6",
      color: "var(--foreground)",
    },
  });
}

export function toastDismiss(id?: string | number) {
  sonnerToast.dismiss(id);
}

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: '"Ark Pixel", monospace',
          fontSize: "12px",
        },
        classNames: {
          toast: "pixel-panel",
          title: "font-bold",
          description: "text-muted-foreground",
        },
      }}
      theme="dark"
      richColors
      closeButton
    />
  );
}
