import type { Guide } from "@/types/guide"
import { Card, CardContent } from "@/components/ui/card"

interface WelcomeSectionProps {
  guide: Guide
}

export function WelcomeSection({ guide }: WelcomeSectionProps) {
  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Bienvenido a VeraTespera</h2>
            <div className="prose prose-lg mx-auto text-center">
              <p className="text-gray-700 leading-relaxed mb-6">{guide.welcome_message}</p>
              <p className="text-blue-600 font-medium text-lg">{guide.host_signature}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
