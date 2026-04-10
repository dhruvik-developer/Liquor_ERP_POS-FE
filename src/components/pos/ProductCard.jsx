import { memo } from 'react'
import { resolveMediaUrl } from '../../utils/url'

const stockBadgeClass = stock => {
  if (stock <= 8) return 'bg-rose-50 text-rose-600 border-rose-100'
  if (stock <= 20) return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-emerald-50 text-emerald-600 border-emerald-100'
}

const terminalCardBg = [
  'bg-[#F8E7D3]',
  'bg-[#EEF2F7]',
  'bg-[#F2F6EE]',
  'bg-[#EFE6F8]',
  'bg-[#F6ECE2]',
  'bg-[#F5EDEF]',
]

const ProductCard = ({ product, onAdd, variant = 'default' }) => {
  const isOutOfStock = Number(product.stock) <= 0

  if (variant === 'terminal') {
    const bgClass = terminalCardBg[Number(product.id) % terminalCardBg.length]
    const imageSrc = resolveMediaUrl(product.image)

    return (
      <button
        type="button"
        onClick={() => onAdd(product)}
        className={`w-full rounded-xl border bg-white p-2.5 text-center transition-all active:scale-[0.99] ${
          isOutOfStock
            ? 'border-[#E2E8F0] bg-[#FCFDFE]'
            : 'border-[#DCE4EE] hover:border-[#1EA7EE] hover:shadow-sm'
        }`}
      >
        <div className={`h-[140px] w-full rounded-lg border border-[#ECF0F5] ${isOutOfStock ? 'bg-[#F7F9FB]' : bgClass} flex items-center justify-center`}>
          <div className="h-[92px] w-[92px] bg-white/55 border border-white/50 flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                loading="lazy"
                className="h-[78px] w-[68px] object-contain"
              />
            ) : (
              <span className="text-[11px] text-[#94A3B8] font-semibold">No Image</span>
            )}
          </div>
        </div>
        <p className={`mt-3 text-[15px] font-black tracking-tight font-poppins line-clamp-1 ${isOutOfStock ? 'text-slate-600' : 'text-slate-800'}`}>{product.name}</p>
        <p className={`mt-1 text-[13px] font-bold transition-colors ${isOutOfStock ? 'text-slate-600' : 'text-slate-900'}`}>${product.price.toFixed(2)}</p>
        <p className={`mt-1 text-[10px] font-black uppercase tracking-widest ml-1 ${isOutOfStock ? 'text-rose-400' : 'text-slate-400'}`}>
          {product.stock} in stock
        </p>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className={`w-full rounded-lg border bg-white p-3 text-left shadow-sm transition-all group active:scale-[0.98] ${
        isOutOfStock
          ? 'border-[#E2E8F0] bg-[#FCFDFE]'
          : 'border-[#E2E8F0] hover:border-[#0EA5E9] hover:shadow-md'
      }`}
    >
      <div className={`h-32 w-full rounded-md overflow-hidden border border-[#F1F5F9] ${isOutOfStock ? 'bg-[#F7F9FB]' : 'bg-[#F8FAFC]'}`}>
        <img
          src={resolveMediaUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-contain p-2 transition-transform ${isOutOfStock ? '' : 'group-hover:scale-110'}`}
        />
      </div>
      <div className="mt-3">
        <p className={`line-clamp-2 text-[14px] font-bold leading-tight min-h-[40px] transition-colors ${
          isOutOfStock ? 'text-slate-600' : 'text-[#1E293B] group-hover:text-[#0EA5E9]'
        }`}>{product.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-[18px] font-black tracking-tight ${isOutOfStock ? 'text-slate-600' : 'text-[#0EA5E9]'}`}>${product.price.toFixed(2)}</span>
          <span className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded-md border ${stockBadgeClass(product.stock)}`}>
            STK {product.stock}
          </span>
        </div>
      </div>
    </button>
  )
}

export default memo(ProductCard)
