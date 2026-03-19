const rowClass = 'flex items-center justify-between text-[14px] text-[#64748B] font-medium'

const BillingSummary = ({ subtotal, tax, discount, grandTotal, onDiscountChange }) => (
  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col gap-2 shadow-inner">
    <div className={rowClass}>
      <span>Subtotal</span>
      <span className="font-bold text-[#1E293B]">${subtotal.toFixed(2)}</span>
    </div>
    <div className={rowClass}>
      <span>Tax (GST 18%)</span>
      <span className="font-bold text-[#1E293B]">${tax.toFixed(2)}</span>
    </div>
    <div className={rowClass}>
      <label htmlFor="discount" className="cursor-pointer">Discount</label>
      <input
        id="discount"
        type="number"
        min="0"
        step="0.01"
        value={discount}
        onChange={event => onDiscountChange(event.target.value)}
        className="w-20 h-8 rounded-md border border-[#E2E8F0] px-2 py-1 text-right text-[13px] font-bold text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all"
      />
    </div>
    <div className="mt-2 border-t border-[#E2E8F0] pt-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold text-[#1E293B]">Grand Total</span>
        <span className="text-[24px] font-black text-[#0EA5E9] tracking-tight">${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>
)

export default BillingSummary
