import React from 'react'
import { Check } from 'lucide-react'
import cashIcon from '../../assets/icon/cash.png'
import useCashPaymentSuggestions from '../../hooks/useCashPaymentSuggestions'

const suggestionButtonClassName = (isHighlighted) => [
  'flex h-[46px] items-center justify-center rounded-[14px] border text-[14px] font-semibold transition-all duration-200',
  isHighlighted
    ? 'border-[#9DD8FF] bg-[#EAF7FF] text-[#0B5C8F] shadow-[0_10px_22px_-18px_rgba(30,167,238,0.95)]'
    : 'border-transparent bg-[#F1F5FA] text-[#1A2743] hover:bg-[#E9F3FB]',
].join(' ')

const CashPaymentPopup = ({
  totalAmount,
  countryCode,
  orderReference,
  processing = false,
  onBack,
  onConfirm,
}) => {
  const {
    changeDue,
    currencyMeta,
    exactAmount,
    formatAmount,
    hasPositiveChange,
    numericTenderedAmount,
    resolvedCountryCode,
    setExactAmount,
    setSuggestedAmount,
    suggestedAmounts,
    tenderedAmount,
    setTenderedAmount,
  } = useCashPaymentSuggestions({
    totalAmount,
    countryCode,
  })

  const isFinalizeDisabled = processing || numericTenderedAmount < exactAmount

  return (
    <div className="mx-auto flex h-full w-full max-w-[430px] flex-col justify-center">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#E9F7FF]">
          <img src={cashIcon} alt="Cash payment" className="h-7 w-7 object-contain" />
        </div>
        <h3 className="mt-4 text-[21px] font-black tracking-tight text-[#0F172A]">Cash Payment</h3>
        <p className="mt-1 text-[12px] font-medium text-[#8EA0B4]">
          Process cash transaction for order {orderReference}
        </p>
      </div>

      <div className="mt-9 text-center">
        <p className="text-[14px] font-medium text-[#7B8CA2]">Total Amount Due</p>
        <p className="mt-1 text-[56px] font-black leading-none tracking-tight text-[#1A2743]">
          {formatAmount(exactAmount)}
        </p>
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-[12px] font-medium text-[#7B8CA2]">Amount Tendered</label>
        <div className="flex h-[56px] items-center rounded-[14px] border border-[#DCE6F1] bg-[#F2F6FB] px-4">
          <span className="text-[30px] font-semibold leading-none text-[#7B8CA2]">
            {currencyMeta.symbol}
          </span>
          <input
            type="number"
            min={exactAmount}
            step="0.01"
            value={tenderedAmount}
            onChange={(event) => setTenderedAmount(event.target.value)}
            className="h-full w-full bg-transparent px-3 text-right text-[23px] font-black text-[#1A2743] outline-none"
            aria-label="Amount Tendered"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {suggestedAmounts.map((amount, index) => (
          <button
            key={amount}
            type="button"
            onClick={() => setSuggestedAmount(amount)}
            className={suggestionButtonClassName(index === 0)}
          >
            {formatAmount(amount)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={setExactAmount}
        className="mt-3 flex h-[46px] items-center justify-center rounded-[14px] border border-[#D9E7F3] bg-white text-[14px] font-semibold text-[#1A2743] transition-colors hover:bg-[#F8FBFE]"
      >
        Exact
      </button>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-[16px] font-medium text-[#667A93]">Change Due</span>
        <span className={`text-[20px] font-black ${hasPositiveChange ? 'text-[#1DB954]' : 'text-[#1A2743]'}`}>
          {formatAmount(changeDue)}
        </span>
      </div>

      <button
        type="button"
        disabled={isFinalizeDisabled}
        onClick={() => onConfirm?.({
          paymentMethod: 'Cash',
          amountTendered: numericTenderedAmount,
          changeDue,
          totalAmount: exactAmount,
          countryCode: resolvedCountryCode,
        })}
        className="mt-6 flex h-[54px] items-center justify-center gap-2 rounded-[12px] bg-[#1EA7EE] text-[20px] font-black text-white transition-colors hover:bg-[#1698DA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Check size={18} />
        <span className="text-[20px]">Finalize Payment</span>
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 text-[12px] font-semibold text-[#1EA7EE]"
      >
        Back to payment methods
      </button>
    </div>
  )
}

export default CashPaymentPopup
