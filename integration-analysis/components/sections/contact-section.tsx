import type { ContactInfo } from "@/types/guide"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContactSectionProps {
  contactInfo: ContactInfo
}

export function ContactSection({ contactInfo }: ContactSectionProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Contacto y Emergencias</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-user text-blue-600"></i>
                  Tus Anfitriones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <i className="fas fa-user text-gray-400 w-5"></i>
                  <span>{contactInfo.host_names}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-gray-400 w-5"></i>
                  <span>{contactInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-envelope text-gray-400 w-5"></i>
                  <span>{contactInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fab fa-whatsapp text-green-500 w-5"></i>
                  <span>{contactInfo.whatsapp}</span>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Estamos disponibles para cualquier duda o incidencia durante tu estancia. No dudes en contactarnos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                  Emergencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-gray-400 w-5"></i>
                  <span>
                    <strong>Emergencias:</strong> {contactInfo.emergency_numbers.emergencias}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-gray-400 w-5"></i>
                  <span>
                    <strong>Policía Local:</strong> {contactInfo.emergency_numbers.policia_local}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-gray-400 w-5"></i>
                  <span>
                    <strong>Guardia Civil:</strong> {contactInfo.emergency_numbers.guardia_civil}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-gray-400 w-5"></i>
                  <span>
                    <strong>Bomberos:</strong> {contactInfo.emergency_numbers.bomberos}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-tools text-blue-600"></i>
                Servicios del Apartamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Si encuentras cualquier problema en el apartamento durante tu estancia, por favor contáctanos
                inmediatamente:
              </p>
              <ul className="space-y-2">
                {contactInfo.service_issues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-sm"></i>
                    <span className="text-gray-600">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
