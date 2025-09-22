"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Iconos más utilizados en aplicaciones web (muestra inicial)
const ESSENTIAL_ICONS = {
  solid: [
    // Navegación y UI
    'fas fa-home', 'fas fa-user', 'fas fa-users', 'fas fa-cog', 'fas fa-tools',
    'fas fa-menu', 'fas fa-bars', 'fas fa-times', 'fas fa-check', 'fas fa-plus',
    'fas fa-minus', 'fas fa-edit', 'fas fa-trash', 'fas fa-save', 'fas fa-search',
    'fas fa-filter', 'fas fa-sort', 'fas fa-list', 'fas fa-th', 'fas fa-th-large',
    
    // Comunicación
    'fas fa-phone', 'fas fa-envelope', 'fas fa-comment', 'fas fa-comments',
    'fas fa-share', 'fas fa-link', 'fas fa-copy', 'fas fa-paste',
    
    // Multimedia
    'fas fa-camera', 'fas fa-image', 'fas fa-images', 'fas fa-video', 'fas fa-music',
    'fas fa-volume-up', 'fas fa-volume-down', 'fas fa-volume-mute', 'fas fa-microphone',
    
    // Archivos y documentos
    'fas fa-file', 'fas fa-file-alt', 'fas fa-file-pdf', 'fas fa-file-word',
    'fas fa-file-excel', 'fas fa-folder', 'fas fa-folder-open', 'fas fa-download',
    'fas fa-upload', 'fas fa-print',
    
    // Tecnología
    'fas fa-desktop', 'fas fa-laptop', 'fas fa-tablet-alt', 'fas fa-mobile-alt',
    'fas fa-server', 'fas fa-database', 'fas fa-wifi', 'fas fa-bluetooth',
    'fas fa-ethernet', 'fas fa-signal', 'fas fa-battery-full', 'fas fa-plug',
    
    // Tiempo y calendario
    'fas fa-calendar', 'fas fa-clock', 'fas fa-stopwatch', 'fas fa-hourglass',
    
    // Ubicación y mapas
    'fas fa-map', 'fas fa-map-marker-alt', 'fas fa-globe', 'fas fa-compass',
    
    // Estados y acciones
    'fas fa-play', 'fas fa-pause', 'fas fa-stop', 'fas fa-forward', 'fas fa-backward',
    'fas fa-sync', 'fas fa-refresh', 'fas fa-spinner', 'fas fa-circle-notch',
    
    // Formas y símbolos
    'fas fa-circle', 'fas fa-square', 'fas fa-triangle', 'fas fa-diamond',
    'fas fa-heart', 'fas fa-star', 'fas fa-bookmark', 'fas fa-flag',
    
    // Seguridad y permisos
    'fas fa-lock', 'fas fa-unlock', 'fas fa-key', 'fas fa-shield-alt',
    'fas fa-eye', 'fas fa-eye-slash', 'fas fa-ban', 'fas fa-exclamation-triangle',
    
    // Comercio y dinero
    'fas fa-shopping-cart', 'fas fa-credit-card', 'fas fa-euro-sign', 'fas fa-dollar-sign',
    'fas fa-tag', 'fas fa-percent', 'fas fa-chart-line', 'fas fa-chart-bar',
    
    // Hogar y servicios
    'fas fa-bed', 'fas fa-couch', 'fas fa-tv', 'fas fa-washing-machine',
    'fas fa-shower', 'fas fa-toilet', 'fas fa-kitchen-set', 'fas fa-utensils',
    
    // Transporte
    'fas fa-car', 'fas fa-bus', 'fas fa-train', 'fas fa-plane', 'fas fa-ship',
    'fas fa-bicycle', 'fas fa-motorcycle', 'fas fa-taxi',
    
    // Deportes y actividades
    'fas fa-futbol', 'fas fa-basketball-ball', 'fas fa-volleyball-ball',
    'fas fa-swimming-pool', 'fas fa-dumbbell', 'fas fa-running', 'fas fa-hiking',
    
    // Naturaleza
    'fas fa-sun', 'fas fa-moon', 'fas fa-cloud', 'fas fa-rain', 'fas fa-snowflake',
    'fas fa-tree', 'fas fa-leaf', 'fas fa-seedling', 'fas fa-mountain',
    
    // Salud y medicina
    'fas fa-heartbeat', 'fas fa-stethoscope', 'fas fa-pills', 'fas fa-ambulance',
    'fas fa-hospital', 'fas fa-user-md', 'fas fa-band-aid',
    
    // Educación
    'fas fa-graduation-cap', 'fas fa-book', 'fas fa-pencil-alt', 'fas fa-chalkboard',
    'fas fa-calculator', 'fas fa-microscope', 'fas fa-flask',
    
    // Industria y construcción
    'fas fa-hammer', 'fas fa-wrench', 'fas fa-screwdriver', 'fas fa-tools',
    'fas fa-hard-hat', 'fas fa-truck', 'fas fa-crane',
    
    // Arte y entretenimiento
    'fas fa-palette', 'fas fa-paint-brush', 'fas fa-theater-masks', 'fas fa-magic',
    'fas fa-guitar', 'fas fa-piano', 'fas fa-microphone-alt',
    
    // Comida y bebida
    'fas fa-coffee', 'fas fa-wine-glass', 'fas fa-beer', 'fas fa-pizza-slice',
    'fas fa-hamburger', 'fas fa-ice-cream', 'fas fa-birthday-cake',
    
    // Animales
    'fas fa-paw', 'fas fa-dog', 'fas fa-cat', 'fas fa-fish', 'fas fa-bird',
    'fas fa-horse', 'fas fa-cow', 'fas fa-pig',
    
    // Objetos cotidianos
    'fas fa-umbrella', 'fas fa-sunglasses', 'fas fa-watch', 'fas fa-ring',
    'fas fa-gem', 'fas fa-crown', 'fas fa-trophy', 'fas fa-medal', 'fas fa-award'
  ],
  regular: [
    'far fa-user', 'far fa-heart', 'far fa-star', 'far fa-bookmark',
    'far fa-calendar', 'far fa-clock', 'far fa-envelope', 'far fa-file',
    'far fa-folder', 'far fa-image', 'far fa-comment', 'far fa-circle',
    'far fa-square', 'far fa-play-circle', 'far fa-pause-circle',
    'far fa-stop-circle', 'far fa-check-circle', 'far fa-times-circle',
    'far fa-question-circle', 'far fa-info-circle', 'far fa-exclamation-circle',
    'far fa-plus-circle', 'far fa-minus-circle', 'far fa-edit', 'far fa-save',
    'far fa-trash-alt', 'far fa-search', 'far fa-filter', 'far fa-sort',
    'far fa-list', 'far fa-th', 'far fa-copy', 'far fa-cut', 'far fa-paste',
    'far fa-download', 'far fa-upload', 'far fa-share', 'far fa-link',
    'far fa-unlink', 'far fa-sync', 'far fa-refresh', 'far fa-spinner',
    'far fa-circle-notch', 'far fa-dot-circle', 'far fa-play-circle',
    'far fa-pause-circle', 'far fa-stop-circle', 'far fa-times-circle',
    'far fa-check-circle', 'far fa-question-circle', 'far fa-info-circle',
    'far fa-exclamation-circle', 'far fa-plus-circle', 'far fa-minus-circle',
    'far fa-edit', 'far fa-save', 'far fa-trash-alt', 'far fa-search',
    'far fa-filter', 'far fa-sort', 'far fa-list', 'far fa-th', 'far fa-copy',
    'far fa-cut', 'far fa-paste', 'far fa-download', 'far fa-upload',
    'far fa-share', 'far fa-link', 'far fa-unlink', 'far fa-sync',
    'far fa-refresh', 'far fa-spinner', 'far fa-circle-notch', 'far fa-dot-circle'
  ],
  brands: [
    'fab fa-facebook', 'fab fa-twitter', 'fab fa-instagram', 'fab fa-linkedin',
    'fab fa-youtube', 'fab fa-github', 'fab fa-gitlab', 'fab fa-bitbucket',
    'fab fa-stack-overflow', 'fab fa-reddit', 'fab fa-discord', 'fab fa-slack',
    'fab fa-telegram', 'fab fa-whatsapp', 'fab fa-skype', 'fab fa-zoom',
    'fab fa-google', 'fab fa-google-drive', 'fab fa-google-play', 'fab fa-apple',
    'fab fa-microsoft', 'fab fa-windows', 'fab fa-android', 'fab fa-ubuntu',
    'fab fa-linux', 'fab fa-docker', 'fab fa-aws', 'fab fa-azure',
    'fab fa-firebase', 'fab fa-mongodb', 'fab fa-node-js', 'fab fa-react',
    'fab fa-vue', 'fab fa-angular', 'fab fa-bootstrap', 'fab fa-sass',
    'fab fa-less', 'fab fa-npm', 'fab fa-yarn', 'fab fa-webpack',
    'fab fa-gulp', 'fab fa-grunt', 'fab fa-bower', 'fab fa-jenkins',
    'fab fa-travis', 'fab fa-circleci', 'fab fa-git', 'fab fa-git-alt',
    'fab fa-git-square', 'fab fa-github-square', 'fab fa-gitlab-square',
    'fab fa-bitbucket-square', 'fab fa-stack-overflow-square',
    'fab fa-reddit-square', 'fab fa-discord-square', 'fab fa-slack-square',
    'fab fa-telegram-square', 'fab fa-whatsapp-square', 'fab fa-skype-square',
    'fab fa-zoom-square', 'fab fa-google-square', 'fab fa-google-drive-square',
    'fab fa-google-play-square', 'fab fa-apple-square', 'fab fa-microsoft-square',
    'fab fa-windows-square', 'fab fa-android-square', 'fab fa-ubuntu-square',
    'fab fa-linux-square', 'fab fa-docker-square', 'fab fa-aws-square',
    'fab fa-azure-square', 'fab fa-firebase-square', 'fab fa-mongodb-square',
    'fab fa-node-js-square', 'fab fa-react-square', 'fab fa-vue-square',
    'fab fa-angular-square', 'fab fa-bootstrap-square', 'fab fa-sass-square',
    'fab fa-less-square', 'fab fa-npm-square', 'fab fa-yarn-square',
    'fab fa-webpack-square', 'fab fa-gulp-square', 'fab fa-grunt-square',
    'fab fa-bower-square', 'fab fa-jenkins-square', 'fab fa-travis-square',
    'fab fa-circleci-square', 'fab fa-paypal', 'fab fa-stripe', 'fab fa-cc-visa',
    'fab fa-cc-mastercard', 'fab fa-cc-amex', 'fab fa-cc-paypal', 'fab fa-cc-stripe',
    'fab fa-amazon', 'fab fa-ebay', 'fab fa-shopify', 'fab fa-wordpress',
    'fab fa-drupal', 'fab fa-joomla', 'fab fa-magento', 'fab fa-opencart',
    'fab fa-prestashop', 'fab fa-woocommerce', 'fab fa-squarespace',
    'fab fa-wix', 'fab fa-webflow', 'fab fa-figma', 'fab fa-adobe',
    'fab fa-photoshop', 'fab fa-illustrator', 'fab fa-indesign', 'fab fa-premiere',
    'fab fa-after-effects', 'fab fa-lightroom', 'fab fa-xd', 'fab fa-sketch',
    'fab fa-invision', 'fab fa-marvel', 'fab fa-zeplin', 'fab fa-abstract',
    'fab fa-principle', 'fab fa-framer', 'fab fa-lottie', 'fab fa-rive',
    'fab fa-lunacy', 'fab fa-gravit', 'fab fa-canva', 'fab fa-piktochart',
    'fab fa-infogram', 'fab fa-tableau', 'fab fa-power-bi', 'fab fa-looker',
    'fab fa-sisense', 'fab fa-domo', 'fab fa-chartio', 'fab fa-periscope',
    'fab fa-datawrapper', 'fab fa-rawgraphs', 'fab fa-plotly', 'fab fa-d3-js',
    'fab fa-highcharts', 'fab fa-chart-js', 'fab fa-echarts', 'fab fa-amcharts',
    'fab fa-fusioncharts', 'fab fa-nvd3', 'fab fa-c3', 'fab fa-dc-js',
    'fab fa-crossfilter', 'fab fa-leaflet', 'fab fa-openlayers', 'fab fa-mapbox',
    'fab fa-google-maps', 'fab fa-here', 'fab fa-tomtom', 'fab fa-maps'
  ]
}

interface CompleteIconSelectorProps {
  value?: string
  onChange: (icon: string) => void
  label?: string
  allowCustom?: boolean
  showAllIcons?: boolean
}

export function CompleteIconSelector({
  value,
  onChange,
  label = "Icono",
  allowCustom = true,
  showAllIcons = false,
}: CompleteIconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"solid" | "regular" | "brands">("solid")
  const [customIcon, setCustomIcon] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Filtrar iconos basado en búsqueda
  const filteredIcons = ESSENTIAL_ICONS[activeTab].filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleIconSelect = (icon: string) => {
    onChange(icon)
    setIsOpen(false)
    setSearchTerm("")
  }

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
          {value ? (
            <div className="flex items-center gap-2">
              <i className={value}></i>
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-gray-500">Seleccionar icono</span>
          )}
          <i className="fas fa-chevron-down ml-auto"></i>
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-hidden">
            {!showCustomInput ? (
              <>
                {/* Barra de búsqueda */}
                <div className="p-3 border-b">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar iconos..."
                    className="text-sm"
                  />
                </div>

                {/* Tabs para estilos */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="solid">Solid ({ESSENTIAL_ICONS.solid.length})</TabsTrigger>
                    <TabsTrigger value="regular">Regular ({ESSENTIAL_ICONS.regular.length})</TabsTrigger>
                    <TabsTrigger value="brands">Brands ({ESSENTIAL_ICONS.brands.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="solid" className="p-2">
                    <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                      {filteredIcons.map((icon, index) => (
                        <button
                          key={`solid-${index}-${icon}`}
                          type="button"
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-xs",
                            value === icon && "bg-blue-100 text-blue-600",
                          )}
                          onClick={() => handleIconSelect(icon)}
                          title={icon}
                        >
                          <i className={icon}></i>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="regular" className="p-2">
                    <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                      {filteredIcons.map((icon, index) => (
                        <button
                          key={`regular-${index}-${icon}`}
                          type="button"
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 text-xs",
                            value === icon && "bg-blue-100 text-blue-600",
                          )}
                          onClick={() => handleIconSelect(icon)}
                          title={icon}
                        >
                          <i className={icon}></i>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="brands" className="p-2">
                    <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                      {filteredIcons.map((icon, index) => (
                        <button
                          key={`brands-${index}-${icon}`}
                          type="button"
                          className={cn(
                            "flex flex-col items-center gap-1 p-1 rounded hover:bg-gray-100 text-xs",
                            value === icon && "bg-blue-100 text-blue-600",
                          )}
                          onClick={() => handleIconSelect(icon)}
                          title={icon}
                        >
                          <i className={icon}></i>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Opción de icono personalizado */}
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
