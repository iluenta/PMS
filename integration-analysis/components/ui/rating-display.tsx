"use client"

import { cn } from "@/lib/utils"

interface RatingDisplayProps {
  rating: number
  maxRating?: number
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "stars" | "numeric" | "progress"
  className?: string
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  showValue = true,
  size = "md",
  variant = "stars",
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  if (variant === "numeric") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className={cn("font-medium", sizeClasses[size])}>{rating.toFixed(1)}</span>
        <span className={cn("text-gray-500", sizeClasses[size])}>/{maxRating}</span>
      </div>
    )
  }

  if (variant === "progress") {
    const percentage = (rating / maxRating) * 100
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
        </div>
        {showValue && <span className={cn("text-gray-600 font-medium", sizeClasses[size])}>{rating.toFixed(1)}</span>}
      </div>
    )
  }

  // Stars variant (default)
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const isHalf = rating >= i + 0.5 && rating < starValue
          const isFull = rating >= starValue

          return (
            <div key={i} className="relative">
              <i className={cn("fas fa-star", isFull ? "text-yellow-400" : "text-gray-300", sizeClasses[size])} />
              {isHalf && (
                <i className={cn("fas fa-star-half-alt text-yellow-400 absolute left-0 top-0", sizeClasses[size])} />
              )}
            </div>
          )
        })}
      </div>
      {showValue && (
        <span className={cn("text-gray-600 font-medium ml-1", sizeClasses[size])}>{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
