"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PopularityBadgeProps {
  level: "low" | "medium" | "high" | "trending"
  className?: string
}

const POPULARITY_CONFIG = {
  low: {
    label: "Tranquilo",
    icon: "fas fa-leaf",
    variant: "secondary" as const,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  medium: {
    label: "Popular",
    icon: "fas fa-users",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  high: {
    label: "Muy Popular",
    icon: "fas fa-fire",
    variant: "destructive" as const,
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  trending: {
    label: "Trending",
    icon: "fas fa-trending-up",
    variant: "default" as const,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
}

export function PopularityBadge({ level, className }: PopularityBadgeProps) {
  const config = POPULARITY_CONFIG[level]

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      <i className={`${config.icon} mr-1`}></i>
      {config.label}
    </Badge>
  )
}
