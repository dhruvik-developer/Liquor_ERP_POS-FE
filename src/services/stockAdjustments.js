const asNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeAdjustments = (entries = []) => {
  const quantityByProduct = new Map()

  entries.forEach((entry) => {
    const productId = Number(entry?.product)
    const quantity = Math.trunc(asNumber(entry?.quantity))

    if (!Number.isFinite(productId) || productId <= 0) return
    if (!(quantity >= 1)) return

    quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity)
  })

  return [...quantityByProduct.entries()].map(([product, quantity]) => ({ product, quantity }))
}

export const postStockAdjustments = async ({
  post,
  entries = [],
  adjustmentType = 'add',
  reason = '',
  note = ''
}) => {
  if (typeof post !== 'function') {
    throw new Error('post function is required for stock adjustments')
  }

  const normalized = normalizeAdjustments(entries)
  if (normalized.length === 0) return []

  if (!['add', 'reduce'].includes(adjustmentType)) {
    throw new Error('adjustmentType must be "add" or "reduce"')
  }

  const results = []
  for (const entry of normalized) {
    const response = await post('/inventory/stock-adjustments/', {
      product: entry.product,
      adjustment_type: adjustmentType,
      quantity: entry.quantity,
      reason,
      note
    })
    results.push(response)
  }

  return results
}
