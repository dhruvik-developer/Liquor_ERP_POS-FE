import { useMemo, useState } from 'react'
import {
  currencyDenominations,
  formatCurrencyAmount,
  getCurrencyMeta,
  getDisplaySuggestedAmounts,
  resolveCountryCode,
  roundToCurrencyAmount,
} from '../utils/cashPayment'

export const useCashPaymentSuggestions = ({ totalAmount, countryCode }) => {
  const resolvedCountryCode = useMemo(
    () => resolveCountryCode(countryCode),
    [countryCode],
  )

  const exactAmount = useMemo(
    () => roundToCurrencyAmount(totalAmount),
    [totalAmount],
  )

  const denominations = useMemo(
    () => currencyDenominations[resolvedCountryCode] || currencyDenominations.US,
    [resolvedCountryCode],
  )

  const currencyMeta = useMemo(
    () => getCurrencyMeta(resolvedCountryCode),
    [resolvedCountryCode],
  )

  const suggestedAmounts = useMemo(
    () => getDisplaySuggestedAmounts(exactAmount, denominations, 4),
    [denominations, exactAmount],
  )

  const defaultTenderedAmount = suggestedAmounts[0] ?? exactAmount
  const [tenderedAmount, setTenderedAmount] = useState(() => defaultTenderedAmount.toFixed(2))

  const numericTenderedAmount = Number(tenderedAmount) || 0
  const changeDue = Math.max(
    roundToCurrencyAmount(numericTenderedAmount - exactAmount),
    0,
  )

  return {
    changeDue,
    currencyMeta,
    denominations,
    exactAmount,
    formatAmount: (value) => formatCurrencyAmount(value, resolvedCountryCode),
    hasPositiveChange: changeDue > 0,
    numericTenderedAmount,
    resolvedCountryCode,
    setExactAmount: () => setTenderedAmount(exactAmount.toFixed(2)),
    setSuggestedAmount: (value) => setTenderedAmount(roundToCurrencyAmount(value).toFixed(2)),
    suggestedAmounts,
    tenderedAmount,
    setTenderedAmount,
  }
}

export default useCashPaymentSuggestions
