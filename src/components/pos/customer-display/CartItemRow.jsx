import { formatCustomerDisplayCurrency } from '../../../utils/customerDisplay'
import { resolveMediaUrl } from '../../../utils/url'

const CartItemRow = ({
  item,
  isHighlighted = false,
  shouldAnimate = false,
  showDivider = false,
}) => (
  <article
    className={`flex items-center justify-between gap-4 px-4 py-4 transition-colors duration-300 ${
      isHighlighted ? 'bg-[#f3f4f6]' : 'bg-white'
    } ${showDivider ? 'border-b border-[#e5e7eb]' : ''}`}
    style={shouldAnimate ? { animation: 'customer-display-pop 550ms ease-out' } : undefined}
  >
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f5f6f8] shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
        {item.image ? (
          <img
            src={resolveMediaUrl(item.image)}
            alt={item.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-[#d7dde7]" />
        )}
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[18px] font-[800] tracking-[-0.02em] text-[#1f2937]">
          {item.name}
        </h3>
        <p className="mt-1 text-[15px] font-[600] text-[#64748b]">Qty: {item.quantity}</p>
      </div>
    </div>

    <div className="shrink-0 text-right text-[18px] font-[800] tracking-[-0.02em] text-[#1f2937]">
      {formatCustomerDisplayCurrency(item.lineTotal)}
    </div>
  </article>
)

export default CartItemRow
