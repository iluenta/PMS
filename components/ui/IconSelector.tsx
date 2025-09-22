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
    { icon: "fas fa-home", name: "Casa" },
    { icon: "fas fa-info-circle", name: "Información" },
    { icon: "fas fa-question-circle", name: "Ayuda" },
    { icon: "fas fa-exclamation-circle", name: "Importante" },
    { icon: "fas fa-check-circle", name: "Confirmado" },
    { icon: "fas fa-times-circle", name: "Cancelado" },
    { icon: "fas fa-plus-circle", name: "Agregar" },
    { icon: "fas fa-minus-circle", name: "Quitar" },
    { icon: "fas fa-edit", name: "Editar" },
    { icon: "fas fa-save", name: "Guardar" },
    { icon: "fas fa-trash", name: "Eliminar" },
    { icon: "fas fa-search", name: "Buscar" },
    { icon: "fas fa-filter", name: "Filtrar" },
    { icon: "fas fa-sort", name: "Ordenar" },
    { icon: "fas fa-list", name: "Lista" },
    { icon: "fas fa-th-list", name: "Lista detallada" },
    { icon: "fas fa-table", name: "Tabla" },
    { icon: "fas fa-calendar", name: "Calendario" },
    { icon: "fas fa-clock", name: "Reloj" },
    { icon: "fas fa-map-marker-alt", name: "Ubicación" },
    { icon: "fas fa-phone", name: "Teléfono" },
    { icon: "fas fa-envelope", name: "Email" },
    { icon: "fas fa-user", name: "Usuario" },
    { icon: "fas fa-users", name: "Usuarios" },
    { icon: "fas fa-cog", name: "Configuración" },
    { icon: "fas fa-tools", name: "Herramientas" },
    { icon: "fas fa-wrench", name: "Reparar" },
    { icon: "fas fa-hammer", name: "Construir" },
    { icon: "fas fa-screwdriver", name: "Ajustar" },
    { icon: "fas fa-bolt", name: "Energía" },
    { icon: "fas fa-battery-full", name: "Batería" },
    { icon: "fas fa-plug", name: "Enchufe" },
    { icon: "fas fa-power-off", name: "Apagar" },
    { icon: "fas fa-play", name: "Reproducir" },
    { icon: "fas fa-pause", name: "Pausar" },
    { icon: "fas fa-stop", name: "Detener" },
    { icon: "fas fa-forward", name: "Adelantar" },
    { icon: "fas fa-backward", name: "Retroceder" },
    { icon: "fas fa-volume-up", name: "Volumen" },
    { icon: "fas fa-volume-down", name: "Bajar volumen" },
    { icon: "fas fa-volume-mute", name: "Silenciar" },
    { icon: "fas fa-microphone", name: "Micrófono" },
    { icon: "fas fa-microphone-slash", name: "Sin micrófono" },
    { icon: "fas fa-video", name: "Video" },
    { icon: "fas fa-video-slash", name: "Sin video" },
    { icon: "fas fa-camera", name: "Cámara" },
    { icon: "fas fa-image", name: "Imagen" },
    { icon: "fas fa-images", name: "Imágenes" },
    { icon: "fas fa-file", name: "Archivo" },
    { icon: "fas fa-file-alt", name: "Documento" },
    { icon: "fas fa-file-pdf", name: "PDF" },
    { icon: "fas fa-file-word", name: "Word" },
    { icon: "fas fa-file-excel", name: "Excel" },
    { icon: "fas fa-file-powerpoint", name: "PowerPoint" },
    { icon: "fas fa-folder", name: "Carpeta" },
    { icon: "fas fa-folder-open", name: "Carpeta abierta" },
    { icon: "fas fa-download", name: "Descargar" },
    { icon: "fas fa-upload", name: "Subir" },
    { icon: "fas fa-share", name: "Compartir" },
    { icon: "fas fa-link", name: "Enlace" },
    { icon: "fas fa-unlink", name: "Desenlazar" },
    { icon: "fas fa-copy", name: "Copiar" },
    { icon: "fas fa-cut", name: "Cortar" },
    { icon: "fas fa-paste", name: "Pegar" },
    { icon: "fas fa-undo", name: "Deshacer" },
    { icon: "fas fa-redo", name: "Rehacer" },
    { icon: "fas fa-sync", name: "Sincronizar" },
    { icon: "fas fa-sync-alt", name: "Actualizar" },
    { icon: "fas fa-refresh", name: "Refrescar" },
    { icon: "fas fa-spinner", name: "Cargando" },
    { icon: "fas fa-circle-notch", name: "Procesando" },
    { icon: "fas fa-dot-circle", name: "Punto" },
    { icon: "fas fa-circle", name: "Círculo" },
    { icon: "fas fa-square", name: "Cuadrado" },
    { icon: "fas fa-triangle", name: "Triángulo" },
    { icon: "fas fa-diamond", name: "Diamante" },
    { icon: "fas fa-hexagon", name: "Hexágono" },
    { icon: "fas fa-octagon", name: "Octágono" },
    { icon: "fas fa-pentagon", name: "Pentágono" },
    { icon: "fas fa-ellipsis-h", name: "Más opciones" },
    { icon: "fas fa-ellipsis-v", name: "Menú vertical" },
    { icon: "fas fa-bars", name: "Menú" },
    { icon: "fas fa-th", name: "Cuadrícula" },
    { icon: "fas fa-th-large", name: "Cuadrícula grande" },
    { icon: "fas fa-align-left", name: "Alinear izquierda" },
    { icon: "fas fa-align-center", name: "Centrar" },
    { icon: "fas fa-align-right", name: "Alinear derecha" },
    { icon: "fas fa-align-justify", name: "Justificar" },
    { icon: "fas fa-bold", name: "Negrita" },
    { icon: "fas fa-italic", name: "Cursiva" },
    { icon: "fas fa-underline", name: "Subrayado" },
    { icon: "fas fa-strikethrough", name: "Tachado" },
    { icon: "fas fa-font", name: "Fuente" },
    { icon: "fas fa-text-height", name: "Altura texto" },
    { icon: "fas fa-text-width", name: "Ancho texto" },
    { icon: "fas fa-paragraph", name: "Párrafo" },
    { icon: "fas fa-indent", name: "Sangría" },
    { icon: "fas fa-outdent", name: "Sin sangría" },
    { icon: "fas fa-quote-left", name: "Cita" },
    { icon: "fas fa-quote-right", name: "Cita derecha" },
    { icon: "fas fa-code", name: "Código" },
    { icon: "fas fa-terminal", name: "Terminal" },
    { icon: "fas fa-keyboard", name: "Teclado" },
    { icon: "fas fa-mouse", name: "Ratón" },
    { icon: "fas fa-desktop", name: "Escritorio" },
    { icon: "fas fa-laptop", name: "Portátil" },
    { icon: "fas fa-tablet-alt", name: "Tablet" },
    { icon: "fas fa-mobile-alt", name: "Móvil" },
    { icon: "fas fa-server", name: "Servidor" },
    { icon: "fas fa-database", name: "Base de datos" },
    { icon: "fas fa-hdd", name: "Disco duro" },
    { icon: "fas fa-memory", name: "Memoria" },
    { icon: "fas fa-microchip", name: "Procesador" },
    { icon: "fas fa-network-wired", name: "Red" },
    { icon: "fas fa-wifi", name: "WiFi" },
    { icon: "fas fa-bluetooth", name: "Bluetooth" },
    { icon: "fas fa-bluetooth-b", name: "Bluetooth B" },
    { icon: "fas fa-ethernet", name: "Ethernet" },
    { icon: "fas fa-satellite", name: "Satélite" },
    { icon: "fas fa-satellite-dish", name: "Antena" },
    { icon: "fas fa-broadcast-tower", name: "Torre" },
    { icon: "fas fa-signal", name: "Señal" },
    { icon: "fas fa-signal-1", name: "Señal 1" },
    { icon: "fas fa-signal-2", name: "Señal 2" },
    { icon: "fas fa-signal-3", name: "Señal 3" },
    { icon: "fas fa-signal-4", name: "Señal 4" },
    { icon: "fas fa-signal-5", name: "Señal 5" },
    { icon: "fas fa-signal-6", name: "Señal 6" },
    { icon: "fas fa-signal-7", name: "Señal 7" },
    { icon: "fas fa-signal-8", name: "Señal 8" },
    { icon: "fas fa-signal-9", name: "Señal 9" },
    { icon: "fas fa-signal-10", name: "Señal 10" },
    { icon: "fas fa-signal-11", name: "Señal 11" },
    { icon: "fas fa-signal-12", name: "Señal 12" },
    { icon: "fas fa-signal-13", name: "Señal 13" },
    { icon: "fas fa-signal-14", name: "Señal 14" },
    { icon: "fas fa-signal-15", name: "Señal 15" },
    { icon: "fas fa-signal-16", name: "Señal 16" },
    { icon: "fas fa-signal-17", name: "Señal 17" },
    { icon: "fas fa-signal-18", name: "Señal 18" },
    { icon: "fas fa-signal-19", name: "Señal 19" },
    { icon: "fas fa-signal-20", name: "Señal 20" },
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
                  {icons.map((icon, index) => (
                    <button
                      key={`${category}-${index}-${icon.icon}`}
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

