"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface SuccessAlertProps {
  message: string
  onDismiss?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

export function SuccessAlert({ message, onDismiss, autoHide = true, autoHideDelay = 3000 }: SuccessAlertProps) {
  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay, onDismiss])

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <i className="fas fa-check-circle text-green-600"></i>
      <AlertDescription className="flex items-center justify-between text-green-800">
        <span>{message}</span>
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <i className="fas fa-times"></i>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
