import type { Guide } from "@/types/guide"

interface GuideHeaderProps {
  guide: Guide
}

export function GuideHeader({ guide }: GuideHeaderProps) {
  return (
    <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{guide.title}</h1>
          <p className="text-xl md:text-2xl text-blue-100 text-pretty">
            Tu compañero esencial para disfrutar al máximo tu estancia en VeraTespera
          </p>
        </div>
      </div>
    </header>
  )
}
