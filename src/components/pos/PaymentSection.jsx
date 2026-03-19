const methods = ['Cash', 'Card', 'UPI', 'Split']

const PaymentSection = ({ paymentMethod, onChangeMethod, onCompleteOrder, disabled }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">
      {methods.map(method => (
        <button
          key={method}
          type="button"
          onClick={() => onChangeMethod(method)}
          className={[
            'rounded-lg border px-3 py-2 text-[13px] font-bold transition-all duration-200 shadow-sm',
            paymentMethod === method
              ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white'
              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]',
          ].join(' ')}
        >
          {method}
        </button>
      ))}
    </div>
    
    {paymentMethod === 'Split' && (
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">Split Configuration</p>
        <div className="flex gap-2">
           <div className="flex-1">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Cash Amt</label>
              <input type="text" className="w-full h-8 px-2 rounded-md border border-amber-200 bg-white text-[12px] outline-none focus:border-amber-500" placeholder="0.00" />
           </div>
           <div className="flex-1">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Card Amt</label>
              <input type="text" className="w-full h-8 px-2 rounded-md border border-amber-200 bg-white text-[12px] outline-none focus:border-amber-500" placeholder="0.00" />
           </div>
        </div>
      </div>
    )}

    <button
      type="button"
      onClick={onCompleteOrder}
      disabled={disabled}
      className="w-full h-12 rounded-lg bg-[#0EA5E9] px-4 py-3 text-[14px] font-black text-white transition-all hover:bg-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#94A3B8] shadow-lg shadow-[#0EA5E91A] active:scale-[0.98]"
    >
      Complete Order
    </button>
  </div>
)

export default PaymentSection
