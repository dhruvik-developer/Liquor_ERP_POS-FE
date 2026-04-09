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
  if (variant === 'terminal') {
    const bgClass = terminalCardBg[Number(product.id) % terminalCardBg.length]
    const imageSrc = resolveMediaUrl(product.image)

    return (
      <button
        type="button"
        onClick={() => onAdd(product)}
        className="w-full rounded-xl border border-[#DCE4EE] bg-white p-2.5 text-center transition-all hover:border-[#1EA7EE] hover:shadow-sm active:scale-[0.99]"
      >
        <div className={`h-[140px] w-full rounded-lg border border-[#ECF0F5] ${bgClass} flex items-center justify-center`}>
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
        <p className="mt-3 text-[15px] font-black text-slate-800 tracking-tight font-poppins line-clamp-1">{product.name}</p>
        <p className="mt-1 text-[13px] font-bold transition-colors text-slate-900">${product.price.toFixed(2)}</p>
        <p className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{product.stock} in stock</p>
      </button>
    )
  }

  return (
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
}

export default memo(ProductCard)
