"use client"

import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  List
} from "lucide-react"

type ViewMode = 'calendar' | 'list'

interface CalendarNavigationProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export default function CalendarNavigation({
  currentView,
  onViewChange
}: CalendarNavigationProps) {
  const navigationItems = [
    {
      id: 'calendar' as ViewMode,
      label: 'Calendario',
      icon: Calendar
    },
    {
      id: 'list' as ViewMode,
      label: 'Lista',
      icon: List
    }
  ]

  return (
    <div className="flex items-center justify-between bg-blue-600 text-white px-6 py-4 rounded-lg">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">Disponibilidad</h1>
      </div>
      
      <div className="flex space-x-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          const isActive = currentView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`${
                isActive 
                  ? "bg-white text-blue-600 hover:bg-gray-100" 
                  : "text-white hover:bg-blue-700"
              }`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
} 