import type { Beach } from "@/types/guide"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BeachesSectionProps {
  beaches: Beach[]
}

export function BeachesSection({ beaches }: BeachesSectionProps) {
  return (
    <section className="py-12 bg-blue-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Playas de Vera</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beaches.map((beach) => (
              <Card key={beach.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${beach.image_url}')` }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {beach.badge}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{beach.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{beach.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-walking"></i>
                      {beach.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-star text-yellow-500"></i>
                      {beach.rating}/5
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
