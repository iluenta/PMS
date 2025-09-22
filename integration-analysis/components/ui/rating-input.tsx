"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  label?: string
  max?: number
  allowHalf?: boolean
  showValue?: boolean
}

export function RatingInput({
  value,
  onChange,
  label = "Puntuación",
  max = 5,
  allowHalf = true,
  showValue = true,
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const handleClick = (rating: number) => {
    onChange(rating)
  }

  const handleMouseEnter = (rating: number) => {
    setHoverValue(rating)
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  const displayValue = hoverValue !== null ? hoverValue : value

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: max }, (_, i) => {
            const starValue = i + 1
            const halfValue = i + 0.5

            return (
              <div key={i} className="relative">
                {allowHalf && (
                  <button
                    type="button"
                    className="absolute left-0 w-1/2 h-full z-10"
                    onClick={() => handleClick(halfValue)}
                    onMouseEnter={() => handleMouseEnter(halfValue)}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
                <button
                  type="button"
                  className={cn(
                    "text-lg transition-colors",
                    allowHalf ? "absolute right-0 w-1/2 h-full z-10" : "relative",
                  )}
                  onClick={() => handleClick(starValue)}
                  onMouseEnter={() => handleMouseEnter(starValue)}
                  onMouseLeave={handleMouseLeave}
                >
                  <i
                    className={cn(
                      "fas fa-star",
                      displayValue >= starValue
                        ? "text-yellow-400"
                        : displayValue >= halfValue && allowHalf
                          ? "text-yellow-400"
                          : "text-gray-300",
                    )}
                  />
                </button>
                {allowHalf && displayValue >= halfValue && displayValue < starValue && (
                  <i className="fas fa-star-half-alt text-yellow-400 text-lg absolute left-0 top-0" />
                )}
              </div>
            )
          })}
        </div>

        {showValue && (
          <span className="text-sm text-gray-600 ml-2">
            {displayValue.toFixed(allowHalf ? 1 : 0)}/{max}
          </span>
        )}
      </div>
    </div>
  )
}
