"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorAlertProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <i className="fas fa-exclamation-triangle"></i>
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <i className="fas fa-redo mr-1"></i>
              Reintentar
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <i className="fas fa-times"></i>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
