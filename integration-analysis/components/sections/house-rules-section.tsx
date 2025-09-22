import type { HouseRule } from "@/types/guide"
import { Card, CardContent } from "@/components/ui/card"

interface HouseRulesSectionProps {
  rules: HouseRule[]
}

export function HouseRulesSection({ rules }: HouseRulesSectionProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Normas de la Casa</h2>
          <p className="text-center text-gray-600 mb-8">
            Para garantizar una estancia agradable para todos, te pedimos que respetes las siguientes normas:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${rule.icon} text-2xl text-blue-600`}></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{rule.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{rule.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
