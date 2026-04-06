import { memo } from 'react'
import { resolveMediaUrl } from '../../utils/url'

const stockBadgeClass = stock => {
  if (stock <= 8) return 'bg-rose-50 text-rose-600 border-rose-100'
  if (stock <= 20) return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-emerald-50 text-emerald-600 border-emerald-100'
}

const ProductCard = ({ product, onAdd }) => (
  <button
    type="button"
    onClick={() => onAdd(product)}
    className="w-full rounded-lg border border-[#E2E8F0] bg-white p-3 text-left shadow-sm transition-all hover:border-[#0EA5E9] hover:shadow-md group active:scale-[0.98]"
  >
    <div className="h-32 w-full rounded-md overflow-hidden bg-[#F8FAFC] border border-[#F1F5F9]">
      <img
        src={resolveMediaUrl(product.image)}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-contain p-2 transition-transform group-hover:scale-110"
      />
    </div>
    <div className="mt-3">
      <p className="line-clamp-2 text-[14px] font-bold text-[#1E293B] leading-tight min-h-[40px] group-hover:text-[#0EA5E9] transition-colors">{product.name}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[18px] font-black text-[#0EA5E9] tracking-tight">${product.price.toFixed(2)}</span>
        <span className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded-md border ${stockBadgeClass(product.stock)}`}>
          STK {product.stock}
        </span>
      </div>
    </div>
  </button>
)

export default memo(ProductCard)
