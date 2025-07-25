export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">Verificando autenticación</p>
          <p className="text-xs text-muted-foreground">Espera un momento...</p>
        </div>
      </div>
    </div>
  )
} 