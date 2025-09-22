"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PREDEFINED_BADGES = {
  beaches: [
    { label: "Recomendada", color: "bg-blue-100 text-blue-700" },
    { label: "Familiar", color: "bg-green-100 text-green-700" },
    { label: "Tranquila", color: "bg-gray-100 text-gray-700" },
    { label: "Deportiva", color: "bg-orange-100 text-orange-700" },
    { label: "Nudista", color: "bg-purple-100 text-purple-700" },
    { label: "Accesible", color: "bg-indigo-100 text-indigo-700" },
  ],
  restaurants: [
    { label: "Gourmet", color: "bg-purple-100 text-purple-700" },
    { label: "Clásico", color: "bg-blue-100 text-blue-700" },
    { label: "Marisco", color: "bg-cyan-100 text-cyan-700" },
    { label: "Tapas", color: "bg-orange-100 text-orange-700" },
    { label: "Vegetariano", color: "bg-green-100 text-green-700" },
    { label: "Económico", color: "bg-gray-100 text-gray-700" },
  ],
  activities: [
    { label: "Familiar", color: "bg-green-100 text-green-700" },
    { label: "Deporte", color: "bg-red-100 text-red-700" },
    { label: "Naturaleza", color: "bg-emerald-100 text-emerald-700" },
    { label: "Cultural", color: "bg-purple-100 text-purple-700" },
    { label: "Aventura", color: "bg-orange-100 text-orange-700" },
    { label: "Relajante", color: "bg-blue-100 text-blue-700" },
  ],
  general: [
    { label: "Destacado", color: "bg-yellow-100 text-yellow-700" },
    { label: "Nuevo", color: "bg-green-100 text-green-700" },
    { label: "Popular", color: "bg-red-100 text-red-700" },
    { label: "Especial", color: "bg-purple-100 text-purple-700" },
  ],
}

interface BadgeSelectorProps {
  value?: string
  onChange: (badge: string) => void
  category?: keyof typeof PREDEFINED_BADGES
  label?: string
  allowCustom?: boolean
}

export function BadgeSelector({
  value,
  onChange,
  category = "general",
  label = "Etiqueta",
  allowCustom = true,
}: BadgeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customBadge, setCustomBadge] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const badges = PREDEFINED_BADGES[category]
  const selectedBadge = badges.find((badge) => badge.label === value)

  const handleCustomBadgeSubmit = () => {
    if (customBadge.trim()) {
      onChange(customBadge.trim())
      setCustomBadge("")
      setShowCustomInput(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value ? (
            <Badge variant="secondary" className={selectedBadge?.color}>
              {value}
            </Badge>
          ) : (
            <span className="text-gray-500">Seleccionar etiqueta</span>
          )}
          <i className="fas fa-chevron-down ml-auto"></i>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {!showCustomInput ? (
              <>
                <div className="p-2 space-y-2">
                  {badges.map((badge) => (
                    <button
                      key={badge.label}
                      type="button"
                      className={cn(
                        "w-full text-left p-2 rounded hover:bg-gray-100",
                        value === badge.label && "bg-blue-50",
                      )}
                      onClick={() => {
                        onChange(badge.label)
                        setIsOpen(false)
                      }}
                    >
                      <Badge variant="secondary" className={badge.color}>
                        {badge.label}
                      </Badge>
                    </button>
                  ))}
                </div>
                {allowCustom && (
                  <div className="border-t p-2">
                    <button
                      type="button"
                      className="w-full text-left text-sm text-blue-600 hover:bg-blue-50 p-2 rounded"
                      onClick={() => setShowCustomInput(true)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Etiqueta personalizada
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 space-y-2">
                <Label className="text-sm">Etiqueta personalizada</Label>
                <div className="flex gap-2">
                  <Input
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder="Mi etiqueta"
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleCustomBadgeSubmit}>
                    <i className="fas fa-check"></i>
                  </Button>
                </div>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => setShowCustomInput(false)}
                >
                  ← Volver a etiquetas predefinidas
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
