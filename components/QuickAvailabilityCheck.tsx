"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { useProperty } from "@/hooks/useProperty"

interface QuickAvailabilityCheckProps {
  onCheckAvailability: (checkIn: string, checkOut: string, nights: number) => void
}

export default function QuickAvailabilityCheck({ 
  onCheckAvailability 
}: QuickAvailabilityCheckProps) {
  const { selectedProperty } = useProperty()
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [nights, setNights] = useState(1)

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setNights(diffDays)
    }
  }, [checkInDate, checkOutDate])

  const handleCheckAvailability = () => {
    if (checkInDate && checkOutDate) {
      onCheckAvailability(checkInDate, checkOutDate, nights)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Consulta Rápida
        </CardTitle>
        <CardDescription>Verifica disponibilidad para fechas específicas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkin">Check-in</Label>
            <Input
              id="checkin"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout">Check-out</Label>
            <Input
              id="checkout"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label>Noches</Label>
            <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
              <span className="text-sm font-medium">{nights}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              onClick={handleCheckAvailability}
              disabled={!selectedProperty || !checkInDate || !checkOutDate}
              className="w-full"
            >
              Verificar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 