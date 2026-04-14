import { formatCustomerDisplayCurrency } from '../../../utils/customerDisplay'

const CartSummary = ({ totals }) => (
  <footer className="border-t border-[#e5e7eb] px-5 py-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[16px] font-[600] text-[#64748b]">
        <span>Subtotal</span>
        <span className="font-[700] text-[#475569]">
          {formatCustomerDisplayCurrency(totals?.subtotal)}
        </span>
      </div>
      <div className="flex items-center justify-between text-[16px] font-[600] text-[#64748b]">
        <span>{totals?.taxLabel || 'Taxes & Fees'}</span>
        <span className="font-[700] text-[#475569]">
          {formatCustomerDisplayCurrency(totals?.tax)}
        </span>
      </div>
      {(Number(totals?.giftCardAppliedAmount) || 0) > 0 ? (
        <div className="flex items-center justify-between text-[16px] font-[600] text-[#64748b]">
          <span>Gift Card Applied</span>
          <span className="font-[700] text-[#16a34a]">
            -{formatCustomerDisplayCurrency(totals?.giftCardAppliedAmount)}
          </span>
        </div>
      ) : null}
      <div className="border-t border-dotted border-[#d6dce5] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-[800] tracking-[-0.02em] text-[#1f2937]">TOTAL DUE</span>
          <span className="text-[24px] font-[800] tracking-[-0.03em] text-[#1d9bf0]">
            {formatCustomerDisplayCurrency(totals?.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  </footer>
)

export default CartSummary
