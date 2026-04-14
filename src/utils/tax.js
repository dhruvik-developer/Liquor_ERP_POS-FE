const TAX_RATE_VALUE_KEYS = [
  'rate',
  'tax_rate',
  'taxRate',
  'percentage',
  'percent',
  'value',
  'tax_percentage',
  'taxPercent',
  'tax_factor',
]

const roundToTwo = (value) => {
  const amount = Number(value) || 0
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null

  const normalizedValue = typeof value === 'string'
    ? value.replace('%', '').trim()
    : value

  const parsedValue = Number(normalizedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

const normalizeRate = (value) => {
  const numericValue = toFiniteNumber(value)
  if (numericValue === null) return 0
  if (Math.abs(numericValue) <= 1) return numericValue
  return numericValue / 100
}

const getTaxRateIdentifier = (value) => {
  if (value === null || value === undefined) return null

  if (typeof value === 'object') {
    return value.id ?? value.pk ?? null
  }

  return value
}

const findMatchingTaxRate = (rawTaxRate, taxRates = []) => {
  const identifier = getTaxRateIdentifier(rawTaxRate)
  if (identifier === null || identifier === undefined) return null

  return taxRates.find((taxRate) => String(taxRate?.id ?? taxRate?.pk ?? '') === String(identifier)) || null
}

const extractRateValue = (value) => {
  if (value === null || value === undefined) return null

  if (typeof value !== 'object') {
    return toFiniteNumber(value)
  }

  for (const key of TAX_RATE_VALUE_KEYS) {
    const numericValue = toFiniteNumber(value?.[key])
    if (numericValue !== null) {
      return numericValue
    }
  }

  return null
}

export const formatTaxRateLabel = (rate) => `${roundToTwo(normalizeRate(rate) * 100)}%`

export const resolveTaxRateDetails = (rawTaxRate, taxRates = []) => {
  const matchedTaxRate = findMatchingTaxRate(rawTaxRate, taxRates)
  const matchedRateValue = extractRateValue(matchedTaxRate)

  if (matchedRateValue !== null) {
    const rate = normalizeRate(matchedRateValue)
    return {
      rate,
      label: formatTaxRateLabel(rate),
      matchedTaxRate,
    }
  }

  const rawRateValue = extractRateValue(rawTaxRate)
  if (rawRateValue !== null) {
    const rate = normalizeRate(rawRateValue)
    return {
      rate,
      label: formatTaxRateLabel(rate),
      matchedTaxRate: null,
    }
  }

  return {
    rate: 0,
    label: null,
    matchedTaxRate: matchedTaxRate || null,
  }
}

export const getCartTaxSummary = (cartItems = []) => {
  const normalizedItems = Array.isArray(cartItems) ? cartItems : []
  const positiveRates = new Set()

  const tax = normalizedItems.reduce((sum, item) => {
    const lineSubtotal = (Number(item?.price) || 0) * (Number(item?.quantity) || 0)
    const resolvedTax = resolveTaxRateDetails(item?.taxRate ?? item?.tax_rate)

    if (resolvedTax.rate > 0 && lineSubtotal > 0) {
      positiveRates.add(resolvedTax.rate.toFixed(6))
    }

    return sum + (lineSubtotal * resolvedTax.rate)
  }, 0)

  const taxLabel = positiveRates.size === 1
    ? `Tax (${formatTaxRateLabel(Number([...positiveRates][0]))})`
    : 'Tax'

  return {
    tax: roundToTwo(tax),
    taxLabel,
  }
}

export { roundToTwo }
