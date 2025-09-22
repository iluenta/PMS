"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export function LoadingButton({
  loading = false,
  loadingText = "Cargando...",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} className={cn(loading && "opacity-70", className)} {...props}>
      {loading ? (
        <div className="flex items-center gap-2">
          <i className="fas fa-spinner fa-spin"></i>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  )
}
