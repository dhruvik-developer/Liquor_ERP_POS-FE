const ZERO_LIKE_INPUT_PATTERN = /^0(?:\.0+)?$/

export const isZeroLikeInputValue = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return value === 0

  const normalizedValue = String(value).trim()
  if (!normalizedValue) return false

  return ZERO_LIKE_INPUT_PATTERN.test(normalizedValue)
}

const selectInputValue = (input) => {
  if (!input) return

  if (typeof input.select === 'function') {
    input.select()
    return
  }

  if (typeof input.setSelectionRange === 'function') {
    const valueLength = String(input.value ?? '').length
    input.setSelectionRange(0, valueLength)
  }
}

export const getAutoClearZeroInputProps = (
  value,
  { onFocus, onMouseUp } = {},
) => ({
  onFocus: (event) => {
    onFocus?.(event)

    if (event.defaultPrevented || !isZeroLikeInputValue(value)) return

    const input = event.currentTarget
    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      window.requestAnimationFrame(() => selectInputValue(input))
      return
    }

    selectInputValue(input)
  },
  onMouseUp: (event) => {
    onMouseUp?.(event)

    if (!event.defaultPrevented && isZeroLikeInputValue(value)) {
      event.preventDefault()
    }
  },
})
