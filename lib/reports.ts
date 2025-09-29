import { supabaseServer } from "@/lib/supabase-server"
import { ensureTwoDecimals } from "@/lib/utils/financial"
import { differenceInCalendarDays, addDays, parseISO, isValid, format } from "date-fns"

export interface OverviewFilters {
  tenantId: number
  propertyId?: string
  dateFrom: string
  dateTo: string
  channel?: string
}

export interface OverviewMetrics {
  range: {
    from: string
    to: string
    days: number
  }
  finances: {
    totalRevenue: number
    paymentsReceived: number
    paymentsPending: number
    expenses: number
    netIncome: number
    commissions: number
  }
  operations: {
    occupancyRate: number
    nightsBooked: number
    nightsAvailable: number
    adr: number
    revPar: number
    averageStay: number
  }
  bookings: {
    total: number
    cancelled: number
    cancellationRate: number
    byChannel: Array<{ channel: string; reservations: number; revenue: number }>
  }
  guests: {
    newGuests: number
    returningGuests: number
    repeatRate: number
    averageReviewScore: number | null
  }
  comparative: {
    revenueByProperty: Array<{ propertyId: string; propertyName: string; revenue: number }>
    monthOverMonth: {
      currentRevenue: number
      previousRevenue: number
      change: number | null
    }
  }
  trend: {
    revenueByMonth: Array<{ label: string; revenue: number }>
  }
}

interface ReservationRow {
  id: string
  property_id: string
  check_in: string
  check_out: string | null
  nights: number | null
  total_amount: number | null
  status: string | null
  guest: Record<string, any> | null
  external_source: string | null
  channel_commission: number | null
  collection_commission: number | null
  property_channel?: {
    id: string
    apply_vat?: boolean | null
    vat_percent?: number | null
    channel?: {
      name?: string | null
    } | null
  } | null
}

interface PaymentRow {
  id: string
  reservation_id: string | null
  amount: number | null
  status: string | null
  date: string | null
}

interface ExpenseRow {
  id: string
  property_id: string | null
  amount: number | null
  status: string | null
  date: string | null
}

interface PropertyRow {
  id: string
  name: string | null
}

function parseDate(value: string): Date {
  const parsed = parseISO(value)
  if (!isValid(parsed)) {
    throw new Error(`Invalid date received: ${value}`)
  }
  return parsed
}

function normalizeChannel(source: string | null | undefined): string {
  if (!source) return "Desconocido"
  const normalized = source.trim()
  if (!normalized) return "Desconocido"
  return normalized
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function safeNumber(value: number | null | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0
}

export async function getOverviewMetrics(filters: OverviewFilters): Promise<OverviewMetrics> {
  const { tenantId, propertyId, dateFrom, dateTo, channel } = filters

  const fromDate = parseDate(dateFrom)
  const toDate = parseDate(dateTo)
  const days = Math.max(1, differenceInCalendarDays(toDate, fromDate) + 1)

  const channelFilter = channel && channel !== "all" ? channel.toLowerCase() : undefined
  const propertyFilter = propertyId && propertyId !== "all" ? propertyId : undefined

  const reservationsQuery = supabaseServer
    .from<ReservationRow>("reservations")
    .select(`
      id,
      property_id,
      check_in,
      check_out,
      nights,
      total_amount,
      status,
      guest,
      external_source,
      channel_commission,
      collection_commission,
      property_channel:property_channels!reservations_property_channel_fkey (
        id,
        apply_vat,
        vat_percent,
        channel:distribution_channels ( name )
      )
    `)
    .eq("tenant_id", tenantId)
    .gte("check_in", dateFrom)
    .lte("check_in", dateTo)

  if (propertyFilter) {
    reservationsQuery.eq("property_id", propertyFilter)
  }

  const paymentsQuery = supabaseServer
    .from<PaymentRow>("payments")
    .select("id, reservation_id, amount, status, date")
    .eq("tenant_id", tenantId)
    .gte("date", dateFrom)
    .lte("date", dateTo)

  const expensesQuery = supabaseServer
    .from<ExpenseRow>("expenses")
    .select("id, property_id, amount, status, date")
    .eq("tenant_id", tenantId)
    .gte("date", dateFrom)
    .lte("date", dateTo)

  if (propertyFilter) {
    expensesQuery.eq("property_id", propertyFilter)
  }

  const propertiesQuery = supabaseServer
    .from<PropertyRow>("properties")
    .select("id, name")
    .eq("tenant_id", tenantId)

  if (propertyFilter) {
    propertiesQuery.eq("id", propertyFilter)
  }

  const [reservationsResult, paymentsResult, expensesResult, propertiesResult] = await Promise.all([
    reservationsQuery,
    paymentsQuery,
    expensesQuery,
    propertiesQuery
  ])

  if (reservationsResult.error) throw reservationsResult.error
  if (paymentsResult.error) throw paymentsResult.error
  if (expensesResult.error) throw expensesResult.error
  if (propertiesResult.error) throw propertiesResult.error

  let reservations = reservationsResult.data ?? []
  if (channelFilter) {
    reservations = reservations.filter(reservation => {
      const extSource = reservation.external_source ? reservation.external_source.toLowerCase() : ""
      const channelName = reservation.property_channel?.channel?.name ? reservation.property_channel.channel.name.toLowerCase() : ""
      return extSource.includes(channelFilter) || channelName.includes(channelFilter)
    })
  }

  const payments = paymentsResult.data ?? []
  const expenses = expensesResult.data ?? []
  const propertyRows = propertiesResult.data ?? []

  const propertyNames = new Map<string, string>()
  propertyRows.forEach(property => {
    propertyNames.set(property.id, property.name ?? "Propiedad")
  })

  const propertySet = new Set(reservations.map(reservation => reservation.property_id))
  const propertyCount = propertyFilter ? 1 : Math.max(propertyRows.length, propertySet.size, 1)

  const nightsAvailable = propertyCount * days

  const reservationsMap = new Map(reservations.map(reservation => [reservation.id, reservation]))
  const relevantPayments = payments.filter(payment =>
    payment.reservation_id !== null && reservationsMap.has(payment.reservation_id)
  )

  const validReservations = reservations.filter(reservation => reservation.status !== "cancelled")
  const cancelledReservations = reservations.length - validReservations.length

  const nightsBooked = validReservations.reduce((total, reservation) => {
    const nights = reservation.nights ?? differenceInCalendarDays(parseDate(reservation.check_out ?? reservation.check_in), parseDate(reservation.check_in))
    return total + Math.max(0, nights)
  }, 0)

  const totalRevenue = validReservations.reduce((total, reservation) => total + safeNumber(reservation.total_amount), 0)

  const commissions = validReservations.reduce((total, reservation) => {
    const baseCommission = safeNumber((reservation as any).channel_commission) + safeNumber((reservation as any).collection_commission)
    return total + baseCommission
  }, 0)

  const paymentsReceived = relevantPayments
    .filter(payment => payment.status === "completed")
    .reduce((total, payment) => total + safeNumber(payment.amount), 0)

  const paymentsPending = relevantPayments
    .filter(payment => payment.status === "pending")
    .reduce((total, payment) => total + safeNumber(payment.amount), 0)

  const validExpenses = expenses.filter(expense => expense.status !== "cancelled")
  const totalExpenses = validExpenses.reduce((total, expense) => total + Math.abs(safeNumber(expense.amount)), 0)

  const netIncome = totalRevenue - totalExpenses - commissions

  const occupancyRate = nightsAvailable > 0 ? ensureTwoDecimals((nightsBooked / nightsAvailable) * 100) : 0
  const adr = validReservations.length > 0 ? ensureTwoDecimals(totalRevenue / validReservations.length) : 0
  const revPar = nightsAvailable > 0 ? ensureTwoDecimals(totalRevenue / nightsAvailable) : 0
  const averageStay = validReservations.length > 0 ? ensureTwoDecimals(nightsBooked / validReservations.length) : 0

  const channelAggregation = new Map<string, { reservations: number; revenue: number }>()
  validReservations.forEach(reservation => {
    const channelLabel = reservation.external_source
      ? toTitleCase(normalizeChannel(reservation.external_source))
      : toTitleCase(normalizeChannel(reservation.property_channel?.channel?.name))
    const entry = channelAggregation.get(channelLabel) ?? { reservations: 0, revenue: 0 }
    entry.reservations += 1
    entry.revenue += safeNumber(reservation.total_amount)
    channelAggregation.set(channelLabel, entry)
  })

  const revenueByProperty = new Map<string, number>()
  validReservations.forEach(reservation => {
    const current = revenueByProperty.get(reservation.property_id) ?? 0
    revenueByProperty.set(reservation.property_id, current + safeNumber(reservation.total_amount))
  })

  const guestOrder = [...validReservations].sort((a, b) => parseDate(a.check_in).getTime() - parseDate(b.check_in).getTime())
  const seenGuests = new Set<string>()
  let newGuests = 0
  let returningGuests = 0
  guestOrder.forEach(reservation => {
    const email = reservation.guest?.email as string | undefined
    if (!email) {
      newGuests += 1
      return
    }
    const key = email.toLowerCase()
    if (seenGuests.has(key)) {
      returningGuests += 1
    } else {
      seenGuests.add(key)
      newGuests += 1
    }
  })

  const repeatRate = seenGuests.size > 0 ? ensureTwoDecimals((returningGuests / (newGuests + returningGuests)) * 100) : 0

  const revenueByMonthMap = new Map<string, number>()
  validReservations.forEach(reservation => {
    const monthLabel = format(parseDate(reservation.check_in), "yyyy-MM")
    const current = revenueByMonthMap.get(monthLabel) ?? 0
    revenueByMonthMap.set(monthLabel, current + safeNumber(reservation.total_amount))
  })

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, revenue]) => ({ label, revenue: ensureTwoDecimals(revenue) }))

  const revenueByPropertyArray = Array.from(revenueByProperty.entries()).map(([id, revenue]) => ({
    propertyId: id,
    propertyName: propertyNames.get(id) ?? "Propiedad",
    revenue: ensureTwoDecimals(revenue)
  }))

  const previousRevenue = await computePreviousRevenue({
    tenantId,
    propertyId: propertyFilter,
    from: fromDate,
    days,
    channelFilter
  })

  const monthOverMonthChange = previousRevenue > 0
    ? ensureTwoDecimals(((totalRevenue - previousRevenue) / previousRevenue) * 100)
    : null

  return {
    range: {
      from: dateFrom,
      to: dateTo,
      days
    },
    finances: {
      totalRevenue: ensureTwoDecimals(totalRevenue),
      paymentsReceived: ensureTwoDecimals(paymentsReceived),
      paymentsPending: ensureTwoDecimals(paymentsPending),
      expenses: ensureTwoDecimals(totalExpenses),
      netIncome: ensureTwoDecimals(netIncome),
      commissions: ensureTwoDecimals(commissions)
    },
    operations: {
      occupancyRate,
      nightsBooked,
      nightsAvailable,
      adr,
      revPar,
      averageStay
    },
    bookings: {
      total: validReservations.length,
      cancelled: cancelledReservations,
      cancellationRate: reservations.length > 0 ? ensureTwoDecimals((cancelledReservations / reservations.length) * 100) : 0,
      byChannel: Array.from(channelAggregation.entries()).map(([channelName, value]) => ({
        channel: channelName,
        reservations: value.reservations,
        revenue: ensureTwoDecimals(value.revenue)
      }))
    },
    guests: {
      newGuests,
      returningGuests,
      repeatRate,
      averageReviewScore: null
    },
    comparative: {
      revenueByProperty: revenueByPropertyArray,
      monthOverMonth: {
        currentRevenue: ensureTwoDecimals(totalRevenue),
        previousRevenue: ensureTwoDecimals(previousRevenue),
        change: monthOverMonthChange
      }
    },
    trend: {
      revenueByMonth
    }
  }
}

async function computePreviousRevenue(options: {
  tenantId: number
  propertyId?: string
  from: Date
  days: number
  channelFilter?: string
}): Promise<number> {
  const prevTo = addDays(options.from, -1)
  const prevFrom = addDays(prevTo, -(options.days - 1))

  const query = supabaseServer
    .from<ReservationRow>("reservations")
    .select(`
      total_amount,
      status,
      external_source,
      property_channel:property_channels!reservations_property_channel_fkey (
        channel:distribution_channels ( name )
      )
    `)
    .eq("tenant_id", options.tenantId)
    .gte("check_in", format(prevFrom, "yyyy-MM-dd"))
    .lte("check_in", format(prevTo, "yyyy-MM-dd"))

  if (options.propertyId) {
    query.eq("property_id", options.propertyId)
  }

  const { data, error } = await query
  if (error) {
    console.error("Error computing previous revenue", error)
    return 0
  }

  const channelFilter = options.channelFilter
  const filtered = channelFilter
    ? (data ?? []).filter(reservation => {
        const extSource = reservation.external_source ? reservation.external_source.toLowerCase() : ""
        const channelName = reservation.property_channel?.channel?.name ? reservation.property_channel.channel.name.toLowerCase() : ""
        return extSource.includes(channelFilter) || channelName.includes(channelFilter)
      })
    : (data ?? [])

  return filtered
    .filter(reservation => reservation.status !== "cancelled")
    .reduce((total, reservation) => total + safeNumber(reservation.total_amount), 0)
}
