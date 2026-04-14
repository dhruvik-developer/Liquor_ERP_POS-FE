export const currencyDenominations = {
  IN: [1, 2, 5, 10, 20, 50, 100, 200, 500],
  US: [1, 5, 10, 20, 50, 100],
  EU: [5, 10, 20, 50, 100, 200],
}

const CURRENCY_META = {
  IN: { locale: 'en-IN', currency: 'INR', symbol: '\u20B9' },
  US: { locale: 'en-US', currency: 'USD', symbol: '$' },
  EU: { locale: 'de-DE', currency: 'EUR', symbol: '\u20AC' },
}

const EU_REGION_CODES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
])

export const roundToCurrencyAmount = (value) => (
  Math.round(((Number(value) || 0) + Number.EPSILON) * 100) / 100
)

export const getSuggestedAmounts = (amount, denominations = []) => {
  const roundedAmount = roundToCurrencyAmount(amount)
  const roundedSuggestions = denominations.map((denomination) => (
    Math.ceil(roundedAmount / denomination) * denomination
  ))

  return [...new Set([roundedAmount, ...roundedSuggestions])]
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right)
}

const getBrowserLocale = () => {
  if (typeof navigator === 'undefined') {
    return 'en-US'
  }

  return navigator.language || 'en-US'
}

export const detectCountryCodeFromLocale = (locale = getBrowserLocale()) => {
  const normalizedLocale = String(locale || '').trim()
  const normalizedLocaleLower = normalizedLocale.toLowerCase()
  const localeRegion = normalizedLocale.split('-')[1]?.toUpperCase()

  if (normalizedLocaleLower.startsWith('en-in') || normalizedLocaleLower.startsWith('hi')) return 'IN'
  if (normalizedLocaleLower.startsWith('en-us')) return 'US'
  if (localeRegion === 'IN') return 'IN'
  if (localeRegion === 'US') return 'US'
  if (localeRegion && EU_REGION_CODES.has(localeRegion)) return 'EU'
  if (['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi'].some((code) => normalizedLocaleLower.startsWith(code))) {
    return 'EU'
  }

  return 'US'
}

export const resolveCountryCode = (countryCode) => {
  const normalizedCountryCode = String(countryCode || '').trim().toUpperCase()

  if (normalizedCountryCode in currencyDenominations) {
    return normalizedCountryCode
  }

  return detectCountryCodeFromLocale()
}

export const getCurrencyMeta = (countryCode) => (
  CURRENCY_META[resolveCountryCode(countryCode)] || CURRENCY_META.US
)

export const formatCurrencyAmount = (value, countryCode) => {
  const currencyMeta = getCurrencyMeta(countryCode)

  return new Intl.NumberFormat(currencyMeta.locale, {
    style: 'currency',
    currency: currencyMeta.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundToCurrencyAmount(value))
}

const getReasonableIncrement = (amount, denominations) => {
  const positiveDenominations = [...new Set(denominations)]
    .filter((denomination) => Number(denomination) > 0)
    .sort((left, right) => left - right)

  if (positiveDenominations.length === 0) {
    return 1
  }

  const normalizedAmount = Math.max(roundToCurrencyAmount(amount), 1)
  return (
    positiveDenominations.find((denomination) => denomination >= normalizedAmount * 0.1)
    || positiveDenominations.at(-1)
    || 1
  )
}

export const getDisplaySuggestedAmounts = (amount, denominations, limit = 4) => {
  const roundedAmount = roundToCurrencyAmount(amount)
  const suggestions = getSuggestedAmounts(roundedAmount, denominations)
  const higherSuggestions = suggestions.filter((value) => value > roundedAmount)

  if (higherSuggestions.length >= limit) {
    return higherSuggestions.slice(0, limit)
  }

  const increment = getReasonableIncrement(roundedAmount, denominations)
  const nextSuggestions = [...higherSuggestions]
  let candidate = nextSuggestions.at(-1) ?? roundedAmount

  while (nextSuggestions.length < limit) {
    candidate = roundToCurrencyAmount(candidate + increment)

    if (!nextSuggestions.includes(candidate) && candidate > roundedAmount) {
      nextSuggestions.push(candidate)
    }
  }

  return nextSuggestions
}
