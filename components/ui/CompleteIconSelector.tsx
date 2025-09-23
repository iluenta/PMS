import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Iconos que DEFINITIVAMENTE existen en Font Awesome 6.7.2 FREE
const ESSENTIAL_ICONS = {
  solid: [
    // Iconos básicos del hogar
    'fa-solid fa-home', 'fa-solid fa-building', 'fa-solid fa-bed', 'fa-solid fa-couch', 'fa-solid fa-chair', 
    'fa-solid fa-table', 'fa-solid fa-tv', 'fa-solid fa-wifi', 'fa-solid fa-lightbulb', 'fa-solid fa-clock', 
    'fa-solid fa-calendar', 'fa-solid fa-image', 'fa-solid fa-door-open',
    
    // Cocina
    'fa-solid fa-utensils', 'fa-solid fa-coffee', 'fa-solid fa-wine-glass', 'fa-solid fa-beer',
    'fa-solid fa-pizza-slice', 'fa-solid fa-hamburger', 'fa-solid fa-birthday-cake', 'fa-solid fa-ice-cream',
    
    // Baño
    'fa-solid fa-shower', 'fa-solid fa-bath', 'fa-solid fa-toilet',
    
    // Exterior
    'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud', 'fa-solid fa-umbrella',
    'fa-solid fa-tree', 'fa-solid fa-leaf', 'fa-solid fa-mountain', 'fa-solid fa-water',
    'fa-solid fa-swimming-pool', 'fa-solid fa-fire',
    
    // Transporte
    'fa-solid fa-car', 'fa-solid fa-taxi', 'fa-solid fa-bus', 'fa-solid fa-train', 'fa-solid fa-plane',
    'fa-solid fa-ship', 'fa-solid fa-bicycle', 'fa-solid fa-map', 'fa-solid fa-compass', 'fa-solid fa-globe',
    'fa-solid fa-suitcase', 'fa-solid fa-camera',
    
    // Deportes
    'fa-solid fa-running', 'fa-solid fa-futbol', 'fa-solid fa-basketball-ball', 'fa-solid fa-golf-ball',
    
    // Comercio
    'fa-solid fa-store', 'fa-solid fa-shopping-cart', 'fa-solid fa-credit-card', 'fa-solid fa-tag',
    'fa-solid fa-star', 'fa-solid fa-thumbs-up',
    
    // Servicios
    'fa-solid fa-key', 'fa-solid fa-lock', 'fa-solid fa-phone', 'fa-solid fa-envelope',
    'fa-solid fa-music', 'fa-solid fa-book', 'fa-solid fa-newspaper',
    
    // Salud
    'fa-solid fa-heartbeat', 'fa-solid fa-pills', 'fa-solid fa-thermometer', 'fa-solid fa-ban',
    
    // Herramientas
    'fa-solid fa-tools', 'fa-solid fa-wrench', 'fa-solid fa-hammer',
    
    // Mascotas
    'fa-solid fa-paw', 'fa-solid fa-dog', 'fa-solid fa-cat', 'fa-solid fa-fish',
    
    // Eventos
    'fa-solid fa-gift', 'fa-solid fa-crown', 'fa-solid fa-trophy',
    
    // Tecnología
    'fa-solid fa-laptop', 'fa-solid fa-tablet-alt', 'fa-solid fa-mobile-alt', 'fa-solid fa-headphones',
    'fa-solid fa-microphone', 'fa-solid fa-video', 'fa-solid fa-gamepad', 'fa-solid fa-desktop'
  ],
  regular: [
    // Solo iconos que REALMENTE existen en Font Awesome 6.7.2 FREE Regular
    'fa-regular fa-calendar', 'fa-regular fa-clock', 'fa-regular fa-envelope', 
    'fa-regular fa-heart', 'fa-regular fa-star', 'fa-regular fa-bookmark', 'fa-regular fa-user',
    'fa-regular fa-image', 'fa-regular fa-sun', 'fa-regular fa-moon',
    'fa-regular fa-circle', 'fa-regular fa-square', 'fa-regular fa-play-circle', 
    'fa-regular fa-check-circle', 'fa-regular fa-times-circle',
    'fa-regular fa-question-circle', 'fa-regular fa-info-circle', 
    'fa-regular fa-plus-circle', 'fa-regular fa-minus-circle', 'fa-regular fa-edit', 
    'fa-regular fa-trash-alt', 'fa-regular fa-copy', 'fa-regular fa-save',
    'fa-regular fa-file', 'fa-regular fa-folder', 'fa-regular fa-folder-open',
    'fa-regular fa-address-book', 'fa-regular fa-id-card', 'fa-regular fa-credit-card',
    'fa-regular fa-bell', 'fa-regular fa-comment', 'fa-regular fa-comments',
    'fa-regular fa-thumbs-up', 'fa-regular fa-thumbs-down', 'fa-regular fa-hand-paper',
    'fa-regular fa-hand-rock', 'fa-regular fa-hand-scissors', 'fa-regular fa-hand-point-up',
    'fa-regular fa-smile', 'fa-regular fa-frown', 'fa-regular fa-meh',
    'fa-regular fa-eye', 'fa-regular fa-eye-slash', 'fa-regular fa-lightbulb'
  ],
  brands: [
    // Solo marcas básicas que REALMENTE existen en Font Awesome 6.7.2 FREE
    'fa-brands fa-facebook', 'fa-brands fa-twitter', 'fa-brands fa-instagram', 'fa-brands fa-linkedin',
    'fa-brands fa-youtube', 'fa-brands fa-google', 'fa-brands fa-paypal', 'fa-brands fa-stripe',
    'fa-brands fa-whatsapp', 'fa-brands fa-telegram', 'fa-brands fa-skype', 'fa-brands fa-pinterest',
    'fa-brands fa-vimeo', 'fa-brands fa-spotify', 'fa-brands fa-airbnb', 'fa-brands fa-uber',
    'fa-brands fa-github', 'fa-brands fa-apple', 'fa-brands fa-microsoft', 'fa-brands fa-amazon',
    'fa-brands fa-wordpress', 'fa-brands fa-shopify', 'fa-brands fa-reddit', 'fa-brands fa-discord',
    'fa-brands fa-slack', 'fa-brands fa-tiktok', 'fa-brands fa-snapchat'
  ]
}

interface CompleteIconSelectorProps {
  value?: string
  onChange: (icon: string) => void
}

export function CompleteIconSelector({ value, onChange }: CompleteIconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customIcon, setCustomIcon] = useState("")

  const allIcons = [
    ...ESSENTIAL_ICONS.solid,
    ...ESSENTIAL_ICONS.regular,
    ...ESSENTIAL_ICONS.brands
  ]

  const filteredIcons = allIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleIconSelect = (icon: string) => {
    onChange(icon)
    setOpen(false)
  }

  const handleCustomIconSubmit = () => {
    if (customIcon.trim()) {
      onChange(customIcon.trim())
      setCustomIcon("")
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="icon">Icono</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              {value && (
                <i 
                  className={value} 
                  style={{ color: '#2563eb', fontSize: '1.25rem', fontWeight: 'bold' }}
                ></i>
              )}
              <span className={cn("font-medium text-blue-600", !value && "text-muted-foreground")}>
                {value || "Seleccionar icono..."}
              </span>
            </div>
            <i className="fas fa-chevron-down h-4 w-4 shrink-0 opacity-50"></i>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[600px] h-[600px] p-0" 
          side="top" 
          align="start" 
          sideOffset={20} 
          avoidCollisions={true}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-4 space-y-4 h-full flex flex-col overflow-hidden">
            <div className="space-y-2 flex-shrink-0">
              <Input
                placeholder="Buscar iconos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 flex-shrink-0">
              <Label>Icono personalizado</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ej: fas fa-custom-icon"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                />
                <Button onClick={handleCustomIconSubmit} size="sm">
                  Usar
                </Button>
              </div>
            </div>

                <Tabs defaultValue="solid" className="w-full flex flex-col flex-1 min-h-0 overflow-hidden">
              <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                <TabsTrigger value="solid">Solid ({ESSENTIAL_ICONS.solid.length})</TabsTrigger>
                <TabsTrigger value="regular">Regular ({ESSENTIAL_ICONS.regular.length})</TabsTrigger>
                <TabsTrigger value="brands">Brands ({ESSENTIAL_ICONS.brands.length})</TabsTrigger>
              </TabsList>
              
                  <TabsContent value="solid" className="mt-4 flex-1 min-h-0 overflow-hidden">
                    <div className="grid grid-cols-8 gap-2 h-full overflow-y-auto pr-2 pb-2">
                  {ESSENTIAL_ICONS.solid
                    .filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((icon) => {
                      const isSelected = value === icon
                      return (
                        <Button
                          key={icon}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-10 w-10 p-0",
                            isSelected && "bg-blue-100 border-2 border-blue-500"
                          )}
                          onClick={() => handleIconSelect(icon)}
                        >
                          <i 
                            className={icon} 
                            style={{ color: '#2563eb', fontSize: '1.25rem' }}
                          ></i>
                        </Button>
                      )
                    })}
                </div>
              </TabsContent>
              
                  <TabsContent value="regular" className="mt-4 flex-1 min-h-0 overflow-hidden">
                    <div className="grid grid-cols-8 gap-2 h-full overflow-y-auto pr-2 pb-2">
                  {ESSENTIAL_ICONS.regular
                    .filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((icon) => {
                      const isSelected = value === icon
                      return (
                        <Button
                          key={icon}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-10 w-10 p-0",
                            isSelected && "bg-blue-100 border-2 border-blue-500"
                          )}
                          onClick={() => handleIconSelect(icon)}
                        >
                          <i 
                            className={icon} 
                            style={{ color: '#2563eb', fontSize: '1.25rem' }}
                          ></i>
                        </Button>
                      )
                    })}
                </div>
              </TabsContent>
              
                  <TabsContent value="brands" className="mt-4 flex-1 min-h-0 overflow-hidden">
                    <div className="grid grid-cols-8 gap-2 h-full overflow-y-auto pr-2 pb-2">
                  {ESSENTIAL_ICONS.brands
                    .filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((icon) => {
                      const isSelected = value === icon
                      return (
                        <Button
                          key={icon}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-10 w-10 p-0",
                            isSelected && "bg-blue-100 border-2 border-blue-500"
                          )}
                          onClick={() => handleIconSelect(icon)}
                        >
                          <i 
                            className={icon} 
                            style={{ color: '#2563eb', fontSize: '1.25rem' }}
                          ></i>
                        </Button>
                      )
                    })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}