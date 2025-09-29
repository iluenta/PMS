import type { Reservation } from "@/lib/supabase"

export interface VatConfig {
  applyVat: boolean
  vatPercent: number
}

const DEFAULT_VAT_PERCENT = 21
const EURO_LOCALE = "es-ES"

export function ensureTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function safeAmount(value?: number | null): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0
  }
  return value
}

export function formatEuro(amount: number, minimumFractionDigits = 2): string {
  return amount.toLocaleString(EURO_LOCALE, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  })
}

export function getReservationCommissions(reservation: Reservation) {
  const channelCommission = safeAmount(reservation.channel_commission)
  const collectionCommission = safeAmount(reservation.collection_commission)
  const totalCommissions = channelCommission + collectionCommission

  return {
    channelCommission,
    collectionCommission,
    totalCommissions,
  }
}

export function getVatConfigFromReservation(
  reservation: Reservation,
  override?: Partial<VatConfig>
): VatConfig {
  if (override) {
    return {
      applyVat: override.applyVat ?? true,
      vatPercent: override.vatPercent ?? DEFAULT_VAT_PERCENT,
    }
  }

  const propertyChannel = reservation.property_channel
  const applyVat = propertyChannel?.apply_vat ?? true
  const vatPercent = propertyChannel?.vat_percent ?? DEFAULT_VAT_PERCENT

  return {
    applyVat,
    vatPercent,
  }
}

export function calculateRequiredAmountWithVat(
  reservation: Reservation,
  vatConfig?: VatConfig
): number {
  const { applyVat, vatPercent } = vatConfig ?? getVatConfigFromReservation(reservation)
  const totalAmount = safeAmount(reservation.total_amount)
  const { totalCommissions } = getReservationCommissions(reservation)

  const vatFactor = applyVat ? 1 + (vatPercent || 0) / 100 : 1
  const totalCommissionsWithVat = totalCommissions * vatFactor
  const result = totalAmount - totalCommissionsWithVat

  return Math.max(0, ensureTwoDecimals(result))
}

export function calculateReservationAmountsWithVat(
  reservation: Reservation,
  vatConfig?: VatConfig
) {
  const { applyVat, vatPercent } = vatConfig ?? getVatConfigFromReservation(reservation)
  const totalAmount = safeAmount(reservation.total_amount)
  const { channelCommission, collectionCommission, totalCommissions } =
    getReservationCommissions(reservation)

  const vatAmount = applyVat ? totalCommissions * ((vatPercent || 0) / 100) : 0
  const finalAmount = calculateRequiredAmountWithVat(reservation, { applyVat, vatPercent })

  return {
    totalAmount,
    channelCommission,
    collectionCommission,
    totalCommissions,
    vatAmount: ensureTwoDecimals(vatAmount),
    finalAmount,
  }
}

export function calculatePaymentStatus(
  reservation: Reservation,
  payments: Array<{ amount?: number | null }> = [],
  vatConfig?: VatConfig
): "paid" | "partial" | "pending" {
  const totalPayments = ensureTwoDecimals(
    payments.reduce((sum, payment) => sum + safeAmount(payment.amount), 0)
  )

  const requiredAmount = calculateRequiredAmountWithVat(reservation, vatConfig)
  const pendingAmount = ensureTwoDecimals(requiredAmount - totalPayments)

  if (requiredAmount <= 0 || pendingAmount <= 0) {
    return "paid"
  }

  if (totalPayments > 0) {
    return "partial"
  }

  return "pending"
}

export function getReservationPaymentSummary(
  reservation: Reservation,
  payments: Array<{ amount?: number | null }> = [],
  vatConfig?: VatConfig
) {
  const requiredAmount = calculateRequiredAmountWithVat(reservation, vatConfig)
  const totalPaid = ensureTwoDecimals(
    payments.reduce((sum, payment) => sum + safeAmount(payment.amount), 0)
  )
  const pendingAmount = ensureTwoDecimals(requiredAmount - totalPaid)

  return {
    requiredAmount,
    totalPaid,
    pendingAmount: Math.max(0, pendingAmount),
    status: calculatePaymentStatus(reservation, payments, vatConfig),
  }
}

export function calculateVatAmount(
  base: number,
  vatPercent: number,
  applyVat: boolean
): number {
  if (!applyVat) {
    return 0
  }
  return ensureTwoDecimals(base * ((vatPercent || 0) / 100))
}

export function aggregateAmounts(values: Array<number | null | undefined>): number {
  return ensureTwoDecimals(values.reduce((sum, value) => sum + safeAmount(value), 0))
}
