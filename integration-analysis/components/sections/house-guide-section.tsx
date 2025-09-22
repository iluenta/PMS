import type { HouseGuideItem } from "@/types/guide"
import { Card, CardContent } from "@/components/ui/card"

interface HouseGuideSectionProps {
  items: HouseGuideItem[]
}

export function HouseGuideSection({ items }: HouseGuideSectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Guía de la Casa</h2>
          <p className="text-center text-gray-600 mb-8">
            Todo lo que necesitas saber sobre el funcionamiento del apartamento:
          </p>

          <div className="space-y-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-xl text-blue-600`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">{item.description}</p>
                      {item.details && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Consejo:</strong> {item.details}
                          </p>
                        </div>
                      )}
                    </div>
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
