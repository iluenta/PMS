"use client"

import { Suspense } from 'react'
import { PropertyExpensesContent } from './PropertyExpensesContent'
import { PropertyExpensesSkeleton } from './PropertyExpensesSkeleton'

export default function PropertyExpenses() {
  return (
    <Suspense fallback={<PropertyExpensesSkeleton />}>
      <PropertyExpensesContent />
    </Suspense>
  )
}
