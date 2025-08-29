import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"

interface PropertyExpensesFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  subcategoryFilter: string
  setSubcategoryFilter: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
  yearFilter: string
  setYearFilter: (value: string) => void
  sortFilter: string
  setSortFilter: (value: string) => void
  categories: Array<{ id: string; description: string }>
  subcategories: Array<{ id: string; description: string; category_id: string }>
  filteredSubcategoriesForFilter: Array<{ id: string; description: string; category_id: string }>
  loadingCategories: boolean
  availableYears: number[]
}

export default function PropertyExpensesFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  subcategoryFilter,
  setSubcategoryFilter,
  dateRangeFilter,
  setDateRangeFilter,
  yearFilter,
  setYearFilter,
  sortFilter,
  setSortFilter,
  categories,
  subcategories,
  filteredSubcategoriesForFilter,
  loadingCategories,
  availableYears,
}: PropertyExpensesFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Filtros principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro de estado */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de categoría */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de subcategoría */}
        <Select 
          value={subcategoryFilter} 
          onValueChange={setSubcategoryFilter}
          disabled={loadingCategories || categoryFilter === "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Subcategoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las subcategorías</SelectItem>
            {filteredSubcategoriesForFilter.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de rango de fechas */}
        <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Rango de fechas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="quarter">Este trimestre</SelectItem>
            <SelectItem value="year">Este año</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de año */}
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los años</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenamiento */}
        <Select value={sortFilter} onValueChange={setSortFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Fecha (más reciente)</SelectItem>
            <SelectItem value="date_asc">Fecha (más antigua)</SelectItem>
            <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
            <SelectItem value="amount_asc">Importe (menor)</SelectItem>
            <SelectItem value="description_asc">Descripción (A-Z)</SelectItem>
            <SelectItem value="description_desc">Descripción (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Indicador de filtros activos */}
      {(searchTerm || statusFilter !== "all" || categoryFilter !== "all" || subcategoryFilter !== "all" || dateRangeFilter !== "all" || yearFilter !== "all") && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Filtros activos:</span>
          {searchTerm && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Búsqueda: "{searchTerm}"
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Estado: {statusFilter === "pending" ? "Pendiente" : statusFilter === "completed" ? "Completado" : "Cancelado"}
            </span>
          )}
          {categoryFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Categoría: {categories.find(c => c.id === categoryFilter)?.description}
            </span>
          )}
          {subcategoryFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Subcategoría: {subcategories.find(s => s.id === subcategoryFilter)?.description}
            </span>
          )}
          {dateRangeFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Fecha: {dateRangeFilter === "today" ? "Hoy" : dateRangeFilter === "week" ? "Última semana" : dateRangeFilter === "month" ? "Este mes" : dateRangeFilter === "quarter" ? "Este trimestre" : "Este año"}
            </span>
          )}
          {yearFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Año: {yearFilter}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
