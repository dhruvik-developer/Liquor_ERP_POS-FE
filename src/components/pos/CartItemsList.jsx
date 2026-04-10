const CartItemsList = ({ items, onIncrease, onDecrease, onRemove }) => (
  <div className="space-y-2">
    {items.length === 0 ? (
      <p className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-3 py-8 text-center text-[22px] font-black text-[#1E293B] tracking-tight">
        Cart is empty.
      </p>
    ) : null}

    {items.map(item => (
      <div key={item.id} className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[14px] font-bold text-[#1E293B]">{item.name}</p>
            <p className="text-[12px] text-[#94A3B8]">${item.price.toFixed(2)} each</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider"
          >
            Remove
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDecrease(item.id)}
              className="h-8 w-8 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[18px] text-[#1E293B] flex items-center justify-center hover:bg-[#E2E8F0]"
            >
              -
            </button>
            <span className="min-w-6 text-center text-[14px] font-bold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onIncrease(item.id)}
              className="h-8 w-8 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[18px] text-[#1E293B] flex items-center justify-center hover:bg-[#E2E8F0]"
            >
              +
            </button>
          </div>
          <p className="text-[14px] font-black text-[#1E293B]">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    ))}
  </div>
)

export default CartItemsList
