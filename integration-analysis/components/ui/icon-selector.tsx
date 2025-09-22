"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ICON_CATEGORIES = {
  beaches: [
    { icon: "fas fa-umbrella-beach", name: "Sombrilla" },
    { icon: "fas fa-water", name: "Agua" },
    { icon: "fas fa-sun", name: "Sol" },
    { icon: "fas fa-swimming-pool", name: "Piscina" },
    { icon: "fas fa-ship", name: "Barco" },
    { icon: "fas fa-anchor", name: "Ancla" },
    { icon: "fas fa-waves", name: "Olas" },
    { icon: "fas fa-fish", name: "Pesca" },
    { icon: "fas fa-volleyball-ball", name: "Voleibol" },
    { icon: "fas fa-surfboard", name: "Surf" },
    { icon: "fas fa-life-ring", name: "Salvavidas" },
    { icon: "fas fa-cocktail", name: "Chiringuito" },
  ],
  restaurants: [
    { icon: "fas fa-utensils", name: "Cubiertos" },
    { icon: "fas fa-pizza-slice", name: "Pizza" },
    { icon: "fas fa-fish", name: "Pescado" },
    { icon: "fas fa-wine-glass", name: "Copa" },
    { icon: "fas fa-coffee", name: "Café" },
    { icon: "fas fa-hamburger", name: "Hamburguesa" },
    { icon: "fas fa-ice-cream", name: "Helado" },
    { icon: "fas fa-bread-slice", name: "Panadería" },
    { icon: "fas fa-cheese", name: "Queso" },
    { icon: "fas fa-pepper-hot", name: "Picante" },
    { icon: "fas fa-wine-bottle", name: "Vino" },
    { icon: "fas fa-birthday-cake", name: "Postres" },
  ],
  activities: [
    { icon: "fas fa-hiking", name: "Senderismo" },
    { icon: "fas fa-bicycle", name: "Bicicleta" },
    { icon: "fas fa-camera", name: "Fotografía" },
    { icon: "fas fa-map", name: "Turismo" },
    { icon: "fas fa-ticket-alt", name: "Entrada" },
    { icon: "fas fa-mountain", name: "Montaña" },
    { icon: "fas fa-running", name: "Deporte" },
    { icon: "fas fa-horse", name: "Equitación" },
    { icon: "fas fa-golf-ball", name: "Golf" },
    { icon: "fas fa-spa", name: "Spa" },
    { icon: "fas fa-theater-masks", name: "Teatro" },
    { icon: "fas fa-music", name: "Música" },
  ],
  house: [
    { icon: "fas fa-wifi", name: "WiFi" },
    { icon: "fas fa-tv", name: "Televisión" },
    { icon: "fas fa-thermometer-half", name: "Temperatura" },
    { icon: "fas fa-key", name: "Llaves" },
    { icon: "fas fa-lightbulb", name: "Iluminación" },
    { icon: "fas fa-shower", name: "Ducha" },
    { icon: "fas fa-bed", name: "Dormitorio" },
    { icon: "fas fa-couch", name: "Salón" },
    { icon: "fas fa-utensils", name: "Cocina" },
    { icon: "fas fa-washing-machine", name: "Lavadora" },
    { icon: "fas fa-parking", name: "Aparcamiento" },
    { icon: "fas fa-swimming-pool", name: "Piscina" },
  ],
  rules: [
    { icon: "fas fa-smoking-ban", name: "No Fumar" },
    { icon: "fas fa-volume-mute", name: "Silencio" },
    { icon: "fas fa-paw", name: "Mascotas" },
    { icon: "fas fa-users", name: "Huéspedes" },
    { icon: "fas fa-clock", name: "Horarios" },
    { icon: "fas fa-trash", name: "Basura" },
    { icon: "fas fa-door-closed", name: "Cerrar" },
    { icon: "fas fa-shield-alt", name: "Seguridad" },
    { icon: "fas fa-exclamation-triangle", name: "Advertencia" },
    { icon: "fas fa-ban", name: "Prohibido" },
    { icon: "fas fa-child", name: "Niños" },
    { icon: "fas fa-glass-cheers", name: "Fiestas" },
  ],
  general: [
    { icon: "fas fa-star", name: "Estrella" },
    { icon: "fas fa-heart", name: "Corazón" },
    { icon: "fas fa-thumbs-up", name: "Me gusta" },
    { icon: "fas fa-fire", name: "Popular" },
    { icon: "fas fa-crown", name: "Premium" },
    { icon: "fas fa-gem", name: "Especial" },
    { icon: "fas fa-award", name: "Premio" },
    { icon: "fas fa-medal", name: "Medalla" },
    { icon: "fas fa-trophy", name: "Trofeo" },
    { icon: "fas fa-bookmark", name: "Favorito" },
    { icon: "fas fa-flag", name: "Destacado" },
    { icon: "fas fa-magic", name: "Recomendado" },
  ],
}

interface IconSelectorProps {
  value?: string
  onChange: (icon: string) => void
  category?: keyof typeof ICON_CATEGORIES
  label?: string
  allowCustom?: boolean
}

export function IconSelector({
  value,
  onChange,
  category = "general",
  label = "Icono",
  allowCustom = true,
}: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customIcon, setCustomIcon] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const icons = ICON_CATEGORIES[category]
  const selectedIcon = icons.find((icon) => icon.icon === value)

  const handleCustomIconSubmit = () => {
    if (customIcon.trim()) {
      onChange(customIcon.trim())
      setCustomIcon("")
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
          {selectedIcon ? (
            <div className="flex items-center gap-2">
              <i className={selectedIcon.icon}></i>
              <span>{selectedIcon.name}</span>
            </div>
          ) : value ? (
            <div className="flex items-center gap-2">
              <i className={value}></i>
              <span>Icono personalizado</span>
            </div>
          ) : (
            <span className="text-gray-500">Seleccionar icono</span>
          )}
          <i className="fas fa-chevron-down ml-auto"></i>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
            {!showCustomInput ? (
              <>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {icons.map((icon) => (
                    <button
                      key={icon.icon}
                      type="button"
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-xs",
                        value === icon.icon && "bg-blue-100 text-blue-600",
                      )}
                      onClick={() => {
                        onChange(icon.icon)
                        setIsOpen(false)
                      }}
                    >
                      <i className={icon.icon}></i>
                      <span className="text-center leading-tight">{icon.name}</span>
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
                      Usar icono personalizado
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 space-y-2">
                <Label className="text-sm">Clase de icono (Font Awesome)</Label>
                <div className="flex gap-2">
                  <Input
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    placeholder="fas fa-custom-icon"
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleCustomIconSubmit}>
                    <i className="fas fa-check"></i>
                  </Button>
                </div>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => setShowCustomInput(false)}
                >
                  ← Volver a iconos predefinidos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
