const QuickActions = ({ onNewOrder, onClearCart, onHoldOrder }) => (
  <div className="grid grid-cols-3 gap-2">
    <button
      type="button"
      onClick={onNewOrder}
      className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] font-bold text-[#1E293B] transition hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
    >
      New Order
    </button>
    <button
      type="button"
      onClick={onClearCart}
      className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-600 transition hover:bg-rose-100"
    >
      Clear Cart
    </button>
    <button
      type="button"
      onClick={onHoldOrder}
      className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[13px] font-bold text-amber-600 transition hover:bg-amber-100"
    >
      Hold Order
    </button>
  </div>
)

export default QuickActions
