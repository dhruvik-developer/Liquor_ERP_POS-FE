import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Check,
  Gift,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import useFetch from '../../hooks/useFetch'
import { resolveMediaUrl } from '../../utils/url'
import cashIcon from '../../assets/icon/cash.png'
import CashPaymentPopup from './CashPaymentPopup'
import cardIcon from '../../assets/icon/card.png'
import splitPaymentIcon from '../../assets/icon/splitpayment.png'
import giftCardIcon from '../../assets/icon/gitfcard.png'
import storeCreditIcon from '../../assets/icon/storecradit.png'

const formatCurrency = (value) => `$${(Number(value) || 0).toFixed(2)}`

const FALLBACK_BRAND_OPTIONS = ['Visa', 'MasterCard', 'Amex', 'Discover']
const STATIC_GIFT_CARD_OPTIONS = [
  { number: 'GFT-1234-5678-9012', balance: 50 },
  { number: 'GFT-1111-2222-3333', balance: 75 },
  { number: 'GFT-4444-5555-6666', balance: 120 },
  { number: 'GFT-7777-8888-9999', balance: 25 },
]
const SPLIT_PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', iconSrc: cashIcon, helperText: 'Pay with cash' },
  { value: 'Card', label: 'Card', iconSrc: cardIcon, helperText: 'XXXX-XXXX-4242' },
]

const isCardMethod = (value) => value?.startsWith('Card')
const isDebitMethod = (value) => value?.startsWith('Card - Debit Card')
const isCreditMethod = (value) => value?.startsWith('Card - Credit Card')
const roundToTwo = (value) => Math.round(((Number(value) || 0) + Number.EPSILON) * 100) / 100
const normalizeGiftCardNumber = (value) => String(value || '').trim().toUpperCase()

const methodCardClassName = (isActive, isDisabled) => [
  'w-full rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-[18px] py-[18px] text-left transition-all duration-200 min-h-[78px]',
  isActive
    ? 'border-[#7CCBFF] bg-[#F3FAFF] shadow-[0_0_0_1px_rgba(14,165,233,0.12)]'
    : 'hover:border-[#CFE2F3] hover:bg-[#FBFDFF]',
  isDisabled ? 'cursor-wait opacity-70' : '',
].join(' ')

const PaymentIcon = ({ src, alt, isActive }) => (
  <img
    src={src}
    alt={alt}
    className={[
      'h-5 w-5 shrink-0 object-contain',
      isActive ? 'opacity-100' : 'opacity-90',
    ].join(' ')}
  />
)

const SummaryItem = ({ item }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#E2E8F0]">
      {item.image ? (
        <img
          src={resolveMediaUrl(item.image)}
          alt={item.name}
          className="h-6 w-6 object-contain"
        />
      ) : (
        <ShoppingBag size={24} className="text-[#94A3B8]" />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#0F172A]">{item.name}</p>
          <p className="mt-1 text-[12px] leading-4 text-[#64748B]">Qty: {item.quantity}</p>
        </div>
        <span className="shrink-0 text-[14px] font-medium leading-5 text-[#0F172A]">{formatCurrency(item.price * item.quantity)}</span>
      </div>
    </div>
  </div>
)

const PaymentMethodCard = ({
  iconSrc,
  title,
  description,
  isActive,
  isDisabled,
  onClick,
  trailing,
  children,
}) => (
  <div className={methodCardClassName(isActive, isDisabled)}>
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE]">
          <PaymentIcon src={iconSrc} alt={title} isActive={isActive} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold leading-6 text-[#0F172A]">{title}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-[#64748B]">{description}</p>
        </div>
      </div>
      <div className="shrink-0 text-[#94A3B8]">{trailing}</div>
    </button>
    {children}
  </div>
)

const NestedMethodButton = ({
  label,
  isActive,
  isDisabled,
  onClick,
  trailing,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    className={[
      'flex w-full items-center gap-3 rounded-[12px] border px-3 py-2 text-left transition-all duration-200',
      isActive
        ? 'border-[#93D5FF] bg-[#F1FAFF]'
        : 'border-transparent bg-white hover:border-[#E2EBF4] hover:bg-[#FBFDFF]',
      isDisabled ? 'cursor-wait opacity-70' : '',
    ].join(' ')}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE]">
      <PaymentIcon src={cardIcon} alt={label} isActive={isActive} />
    </div>
    <span className="flex-1 text-[14px] font-semibold text-[#0F172A]">{label}</span>
    <span className="text-[#9AABBC]">{trailing}</span>
  </button>
)

const BrandButton = ({ brand, isActive, isDisabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    className={[
      'flex items-center gap-2 rounded-[12px] border px-3 py-2 text-left transition-all duration-200',
      isActive
        ? 'border-[#93D5FF] bg-[#F1FAFF]'
        : 'border-[#EEF3F8] bg-white hover:border-[#DBE8F4] hover:bg-[#FBFDFF]',
      isDisabled ? 'cursor-wait opacity-70' : '',
    ].join(' ')}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE]">
      <PaymentIcon src={cardIcon} alt={brand} isActive={isActive} />
    </div>
    <span className="text-[12px] font-semibold text-[#0F172A]">{brand}</span>
  </button>
)

const getSplitPaymentMethodMeta = (method) => (
  SPLIT_PAYMENT_METHODS.find((item) => item.value === method) || SPLIT_PAYMENT_METHODS[0]
)

const PaymentMethodModal = ({
  isOpen,
  cartItems,
  totals,
  taxLabel = 'Tax',
  discount,
  paymentMethod,
  giftCardPayment,
  countryCode,
  processing = false,
  onClose,
  onSelectMethod,
  onApplyGiftCard,
  onFinalizeCash,
}) => {
  const { data: cardSetupsData, loading: isLoadingCardSetups } = useFetch('/inventory/card-setups/')
  const [isCardExpanded, setIsCardExpanded] = useState(isCardMethod(paymentMethod))
  const [isDebitExpanded, setIsDebitExpanded] = useState(isDebitMethod(paymentMethod))
  const [isCreditExpanded, setIsCreditExpanded] = useState(isCreditMethod(paymentMethod))
  const [activeStep, setActiveStep] = useState('methods')
  const [giftCardNumber, setGiftCardNumber] = useState('')
  const [giftCardBalance, setGiftCardBalance] = useState(0)
  const [giftCardAppliedAmount, setGiftCardAppliedAmount] = useState('')
  const [hasCheckedGiftCard, setHasCheckedGiftCard] = useState(false)
  const [giftCardLookupMessage, setGiftCardLookupMessage] = useState('')
  const [giftCardLookupStatus, setGiftCardLookupStatus] = useState('idle')
  const [splitSelectedMethod, setSplitSelectedMethod] = useState('Cash')
  const [splitAmount, setSplitAmount] = useState('')
  const [splitPayments, setSplitPayments] = useState([])
  const originalTotalDue = Number(totals.grandTotal) || 0
  const committedGiftCardAmount = Math.min(Number(giftCardPayment?.appliedAmount) || 0, originalTotalDue)
  const totalDue = Math.max(roundToTwo(originalTotalDue - committedGiftCardAmount), 0)
  const numericGiftCardBalance = Number(giftCardBalance) || 0
  const numericGiftCardAppliedAmount = Number(giftCardAppliedAmount) || 0
  const remainingGiftCardBalanceDue = Math.max(roundToTwo(totalDue - numericGiftCardAppliedAmount), 0)
  const orderReference = `#${String(Math.round(totalDue * 100) || 10567).padStart(5, '0')}`
  const numericSplitAmount = Number(splitAmount) || 0
  const splitTotalPaid = roundToTwo(
    splitPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
  )
  const splitRemainingBalance = Math.max(roundToTwo(totalDue - splitTotalPaid), 0)
  const canAddSplitPayment = numericSplitAmount > 0 && numericSplitAmount <= splitRemainingBalance
  const canCompleteSplitPayment = splitPayments.length > 0 && splitRemainingBalance === 0

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !processing) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, processing])

  useEffect(() => {
    if (!isOpen) return
    setActiveStep('methods')
    setIsCardExpanded(isCardMethod(paymentMethod))
    setIsDebitExpanded(isDebitMethod(paymentMethod))
    setIsCreditExpanded(isCreditMethod(paymentMethod))
    setGiftCardNumber('')
    setGiftCardBalance(0)
    setGiftCardAppliedAmount('')
    setHasCheckedGiftCard(false)
    setGiftCardLookupMessage('')
    setGiftCardLookupStatus('idle')
    setSplitSelectedMethod('Cash')
    setSplitAmount('')
    setSplitPayments([])
  }, [isOpen, paymentMethod, totalDue])

  const handleDirectSelection = async (value) => {
    await onSelectMethod(value)
  }

  const handleCashSelection = () => {
    if (processing) return
    setActiveStep('cash')
  }

  const handleGiftCardSelection = () => {
    if (processing) return
    setActiveStep('gift-card')
    setGiftCardAppliedAmount('')
    setHasCheckedGiftCard(false)
    setGiftCardLookupMessage('')
    setGiftCardLookupStatus('idle')
  }

  const handleSplitPaymentSelection = async () => {
    if (processing) return
    await onSelectMethod('Split Payment')
    setActiveStep('split-payment')
    setSplitSelectedMethod('Cash')
    setSplitAmount('')
    setSplitPayments([])
  }

  const handleGiftCardBalanceCheck = async () => {
    if (processing || !giftCardNumber.trim()) return
    const normalizedGiftCardNumber = normalizeGiftCardNumber(giftCardNumber)
    const matchedGiftCard = STATIC_GIFT_CARD_OPTIONS.find(
      (giftCard) => normalizeGiftCardNumber(giftCard.number) === normalizedGiftCardNumber,
    )

    if (!matchedGiftCard) {
      setGiftCardBalance(0)
      setGiftCardAppliedAmount('')
      setHasCheckedGiftCard(false)
      setGiftCardLookupStatus('error')
      setGiftCardLookupMessage('Gift card not found. Try one of the test card numbers below.')
      return
    }

    setGiftCardNumber(matchedGiftCard.number)
    setGiftCardBalance(matchedGiftCard.balance)
    setGiftCardAppliedAmount(Math.min(matchedGiftCard.balance, totalDue).toFixed(2))
    setHasCheckedGiftCard(true)
    setGiftCardLookupStatus('success')
    setGiftCardLookupMessage(`Gift card found. Available balance: ${formatCurrency(matchedGiftCard.balance)}`)
  }

  const handleCardToggle = () => {
    if (processing) return
    setIsCardExpanded((current) => !current)
  }

  const handleCreditToggle = () => {
    if (processing) return
    setIsCreditExpanded((current) => !current)
  }

  const handleDebitToggle = () => {
    if (processing) return
    setIsDebitExpanded((current) => !current)
  }

  const handleSplitFractionSelect = (divisor) => {
    if (!divisor || totalDue <= 0) return
    setSplitAmount(roundToTwo(totalDue / divisor).toFixed(2))
  }

  const handleAddSplitPayment = () => {
    if (!canAddSplitPayment) return

    const methodMeta = getSplitPaymentMethodMeta(splitSelectedMethod)
    const amount = roundToTwo(numericSplitAmount)

    setSplitPayments((current) => [
      ...current,
      {
        id: `${splitSelectedMethod}-${Date.now()}-${current.length}`,
        method: splitSelectedMethod,
        label: methodMeta.label,
        helperText: methodMeta.helperText,
        amount,
      },
    ])
    setSplitAmount('')
  }

  const handleRemoveSplitPayment = (paymentId) => {
    setSplitPayments((current) => current.filter((payment) => payment.id !== paymentId))
  }

  const activeCardBrandOptions = Array.isArray(cardSetupsData)
    ? cardSetupsData
      .filter((cardSetup) => cardSetup?.status !== false && cardSetup?.name)
      .map((cardSetup) => cardSetup.name)
    : []
  const cardBrandOptions = activeCardBrandOptions.length > 0
    ? activeCardBrandOptions
    : (isLoadingCardSetups ? [] : FALLBACK_BRAND_OPTIONS)

  return (
    <AnimatePresence>
      {isOpen ? (
        <Motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Motion.button
            type="button"
            aria-label="Close payment modal"
            className="absolute inset-0 bg-[#0F172A]/28 backdrop-blur-[3px]"
            onClick={() => {
              if (!processing) {
                onClose()
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <Motion.div
            className="relative w-full max-w-[896px] overflow-hidden rounded-[16px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeStep === 'split-payment' ? (
              <div className="flex max-h-[calc(100vh-32px)] min-h-[620px] flex-col overflow-hidden bg-[#F8FAFC]">
                <div className="flex items-start justify-between gap-4 border-b border-[#E6EDF5] bg-white px-6 py-5 sm:px-8">
                  <div>
                    <h2 className="text-[24px] font-bold leading-8 text-[#0F172A]">Split Payment</h2>
                    <p className="mt-1 text-[12px] font-medium text-[#94A3B8]">Order {orderReference}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[#64748B] transition-colors hover:text-[#0EA5E9] disabled:opacity-60"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Sale</span>
                  </button>
                </div>

                <div className="grid flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[1fr_1.05fr] sm:p-5">
                  <section className="flex min-h-0 flex-col rounded-[16px] border border-[#E6EDF5] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] sm:p-5">
                    <div>
                      <h3 className="text-[14px] font-bold text-[#0F172A]">Select Payment Method</h3>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {SPLIT_PAYMENT_METHODS.map((method) => {
                        const isActive = splitSelectedMethod === method.value

                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setSplitSelectedMethod(method.value)}
                            className={[
                              'flex min-h-[76px] flex-col items-center justify-center rounded-[12px] border px-3 py-3 text-center transition-all',
                              isActive
                                ? 'border-[#3BAEF4] bg-[#F3FAFF] shadow-[0_0_0_1px_rgba(59,174,244,0.12)]'
                                : 'border-[#EEF3F8] bg-[#FAFCFE] hover:border-[#D7E7F4] hover:bg-white',
                            ].join(' ')}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0F2FE]">
                              <PaymentIcon src={method.iconSrc} alt={method.label} isActive={isActive} />
                            </div>
                            <span className="mt-2 text-[13px] font-semibold text-[#0F172A]">{method.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-5 rounded-[14px] border border-[#E8EEF5] bg-[#FBFDFF] p-4">
                      <p className="text-[12px] font-medium text-[#94A3B8]">Amount to Pay</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[22px] font-bold text-[#0F172A]">$</span>
                        <input
                          type="number"
                          min="0"
                          max={splitRemainingBalance}
                          step="0.01"
                          value={splitAmount}
                          onChange={(event) => setSplitAmount(event.target.value)}
                          placeholder="0.00"
                          className="w-full bg-transparent text-[28px] font-bold text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[2, 3, 4].map((divisor) => (
                        <button
                          key={divisor}
                          type="button"
                          onClick={() => handleSplitFractionSelect(divisor)}
                          className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#E8EEF5] bg-[#F8FAFC] text-[13px] font-semibold text-[#475569] transition-colors hover:bg-[#EEF6FD]"
                        >
                          1/{divisor}
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        type="button"
                        onClick={handleAddSplitPayment}
                        disabled={processing || !canAddSplitPayment}
                        className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1EA7EE] text-[14px] font-bold text-white transition-colors hover:bg-[#1698DA] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Plus size={16} />
                        <span>Add Payment</span>
                      </button>

                      {!canAddSplitPayment && splitAmount ? (
                        <p className="mt-2 text-[12px] font-medium text-rose-500">
                          Enter an amount up to {formatCurrency(splitRemainingBalance)}.
                        </p>
                      ) : null}
                    </div>
                  </section>

                  <section className="flex min-h-0 flex-col rounded-[16px] border border-[#E6EDF5] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] sm:p-5">
                    <div>
                      <h3 className="text-[14px] font-bold text-[#0F172A]">Payment Summary</h3>
                    </div>

                    <div className="mt-4 rounded-[14px] bg-[#FBFDFF] p-4">
                      <p className="text-[12px] font-medium text-[#94A3B8]">Total Amount</p>
                      <p className="mt-2 text-right text-[26px] font-bold text-[#0F172A]">{formatCurrency(totalDue)}</p>
                    </div>

                    <div className="mt-4 flex-1 overflow-y-auto rounded-[14px] border border-[#EEF3F8] bg-[#FBFDFF] p-4">
                      <p className="text-[12px] font-medium text-[#94A3B8]">Applied Payments</p>

                      {splitPayments.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {splitPayments.map((payment, index) => (
                            <div
                              key={payment.id}
                              className="flex items-start justify-between gap-3 rounded-[12px] border border-[#E8EEF5] bg-white px-3 py-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F7EE] text-[#16A34A]">
                                  <Check size={12} />
                                </div>
                                <div>
                                  <p className="text-[13px] font-semibold text-[#0F172A]">
                                    Payment {index + 1}: {payment.label}
                                  </p>
                                  <p className="mt-1 text-[11px] text-[#94A3B8]">{payment.helperText}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-[#0F172A]">{formatCurrency(payment.amount)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSplitPayment(payment.id)}
                                  className="text-[#94A3B8] transition-colors hover:text-rose-500"
                                  aria-label={`Remove ${payment.label} payment`}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 flex h-full min-h-[180px] items-center justify-center rounded-[12px] border border-dashed border-[#D8E3EE] bg-white px-4 text-center">
                          <p className="text-[13px] font-medium text-[#94A3B8]">
                            Add split payments to build the payment summary.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-[14px] bg-[#FBFDFF] p-4">
                      <div className="flex items-center justify-between text-[12px] font-medium text-[#94A3B8]">
                        <span>Total Paid</span>
                        <span>{formatCurrency(splitTotalPaid)}</span>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-[13px] font-semibold text-[#0F172A]">Remaining Balance</span>
                        <span className="text-[26px] font-bold text-[#1EA7EE]">{formatCurrency(splitRemainingBalance)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setActiveStep('methods')}
                        disabled={processing}
                        className="inline-flex h-[46px] w-full items-center justify-center rounded-[12px] border border-[#DCE6F1] bg-white text-[14px] font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] disabled:opacity-60"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => onFinalizeCash({ paymentMethod: 'Split Payment', splitPayments })}
                        disabled={processing || !canCompleteSplitPayment}
                        className="inline-flex h-[46px] w-full items-center justify-center rounded-[12px] bg-[#E8EEF5] text-[14px] font-bold text-[#0F172A] transition-colors enabled:bg-[#1EA7EE] enabled:text-white enabled:hover:bg-[#1698DA] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Complete Sale
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
            <div className="grid max-h-[calc(100vh-32px)] min-h-[540px] grid-cols-1 overflow-hidden lg:h-[686px] lg:grid-cols-[358px_1fr]">
              <section className="flex min-h-0 flex-col border-b border-[#ECF1F6] bg-[#F8FAFC] px-8 pb-8 pt-8 lg:border-b-0 lg:border-r lg:border-[#E2E8F0]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[24px] font-bold leading-8 text-[#0F172A]">Order Summary</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="inline-flex items-center gap-1 text-[14px] font-medium text-[#0EA5E9] disabled:opacity-60"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Sale</span>
                  </button>
                </div>

                <div className="mt-8 flex-1 space-y-4 overflow-y-auto pr-4">
                  {cartItems.map((item) => (
                    <SummaryItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="mt-8 border-t border-[#E2E8F0] pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[14px] text-[#64748B]">
                      <span>Subtotal</span>
                      <span className="text-[#0F172A]">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[14px] text-[#64748B]">
                      <span>Discount</span>
                      <span className="text-emerald-500">-{formatCurrency(discount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[14px] text-[#64748B]">
                      <span>{taxLabel}</span>
                      <span className="text-[#0F172A]">{formatCurrency(totals.tax)}</span>
                    </div>
                    {committedGiftCardAmount > 0 ? (
                      <div className="flex items-center justify-between text-[14px] text-[#64748B]">
                        <span>Gift Card Applied</span>
                        <span className="text-emerald-500">-{formatCurrency(committedGiftCardAmount)}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#E2E8F0] pt-6">
                    <span className="text-[18px] font-bold leading-7 text-[#0F172A]">Total Due</span>
                    <span className="text-[30px] font-bold leading-9 text-[#0EA5E9]">{formatCurrency(totalDue)}</span>
                  </div>
                </div>
              </section>

              <section className="flex min-h-0 flex-col bg-white px-5 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
                {activeStep === 'methods' ? (
                  <>
                    <div>
                      <h3 className="text-[30px] font-bold leading-9 text-[#0F172A]">Select Payment Method</h3>
                      <p className="mt-2 text-[16px] leading-6 text-[#64748B]">
                        Choose how the customer would like to pay.
                      </p>
                    </div>

                    <div className="mt-10 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
                      <PaymentMethodCard
                        iconSrc={cashIcon}
                        title="Cash"
                        description="Pay with physical currency"
                        isActive={paymentMethod === 'Cash'}
                        isDisabled={processing}
                        onClick={handleCashSelection}
                        trailing={<ChevronRight size={20} />}
                      />

                      <PaymentMethodCard
                        iconSrc={cardIcon}
                        title="Card"
                        description="Credit or Debit Card"
                        isActive={isCardMethod(paymentMethod) || isCardExpanded}
                        isDisabled={processing}
                        onClick={handleCardToggle}
                        trailing={isCardExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      >
                        {isCardExpanded ? (
                          <div className="mt-3 space-y-2 border-t border-[#E8EEF5] pt-3">
                            <NestedMethodButton
                              label="Debit Card"
                              isActive={isDebitMethod(paymentMethod) || isDebitExpanded}
                              isDisabled={processing}
                              onClick={handleDebitToggle}
                              trailing={isDebitExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            />

                            {isDebitExpanded ? (
                              <div className="grid grid-cols-2 gap-2 pl-3 pt-1">
                                {cardBrandOptions.map((brand) => (
                                  <BrandButton
                                    key={`debit-${brand}`}
                                    brand={brand}
                                    isActive={paymentMethod === `Card - Debit Card - ${brand}`}
                                    isDisabled={processing}
                                    onClick={() => handleDirectSelection(`Card - Debit Card - ${brand}`)}
                                  />
                                ))}
                              </div>
                            ) : null}

                            {isDebitExpanded && isLoadingCardSetups ? (
                              <p className="pl-3 pt-1 text-[12px] font-medium text-[#94A3B8]">Loading card brands...</p>
                            ) : null}

                            <NestedMethodButton
                              label="Credit Card"
                              isActive={isCreditMethod(paymentMethod) || isCreditExpanded}
                              isDisabled={processing}
                              onClick={handleCreditToggle}
                              trailing={isCreditExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            />

                            {isCreditExpanded ? (
                              <div className="grid grid-cols-2 gap-2 pl-3 pt-1">
                                {cardBrandOptions.map((brand) => (
                                  <BrandButton
                                    key={brand}
                                    brand={brand}
                                    isActive={paymentMethod === `Card - Credit Card - ${brand}`}
                                    isDisabled={processing}
                                    onClick={() => handleDirectSelection(`Card - Credit Card - ${brand}`)}
                                  />
                                ))}
                              </div>
                            ) : null}

                            {isCreditExpanded && isLoadingCardSetups ? (
                              <p className="pl-3 pt-1 text-[12px] font-medium text-[#94A3B8]">Loading card brands...</p>
                            ) : null}
                          </div>
                        ) : null}
                      </PaymentMethodCard>

                      <PaymentMethodCard
                        iconSrc={splitPaymentIcon}
                        title="Split Payment"
                        description="Use multiple payment methods"
                        isActive={paymentMethod === 'Split Payment'}
                        isDisabled={processing}
                        onClick={handleSplitPaymentSelection}
                        trailing={<ChevronRight size={20} />}
                      />

                      <PaymentMethodCard
                        iconSrc={giftCardIcon}
                        title="Gift Card"
                        description="Pay with a gift card"
                        isActive={paymentMethod === 'Gift Card' || activeStep === 'gift-card'}
                        isDisabled={processing}
                        onClick={handleGiftCardSelection}
                        trailing={<ChevronRight size={20} />}
                      />

                      <PaymentMethodCard
                        iconSrc={storeCreditIcon}
                        title="Store Credit"
                        description="Apply customer store credit"
                        isActive={paymentMethod === 'Store Credit'}
                        isDisabled={processing}
                        onClick={() => handleDirectSelection('Store Credit')}
                        trailing={<ChevronRight size={20} />}
                      />
                    </div>
                  </>
                ) : activeStep === 'cash' ? (
                  <CashPaymentPopup
                    key={`${countryCode || 'auto'}-${totalDue}`}
                    totalAmount={totalDue}
                    countryCode={countryCode}
                    orderReference={orderReference}
                    processing={processing}
                    onBack={() => setActiveStep('methods')}
                    onConfirm={onFinalizeCash}
                  />
                ) : (
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveStep('methods')}
                        disabled={processing}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0F172A] transition-colors hover:bg-[#F1F5F9] disabled:opacity-60"
                        aria-label="Back to payment methods"
                      >
                        <ArrowLeft size={22} />
                      </button>
                      <h3 className="text-[22px] font-bold leading-8 text-[#0F172A] sm:text-[30px] sm:leading-9">Gift Card Payment</h3>
                    </div>

                    <div className="mt-5 flex-1 overflow-y-auto pb-2 sm:mt-6">
                      <div className="rounded-[20px] border border-[#E6EDF5] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] sm:p-6">
                        <div>
                          <label className="text-[14px] font-semibold leading-5 text-[#64748B] sm:text-[15px]">Gift Card Number</label>
                          <div className="mt-2.5 flex flex-col gap-3 lg:flex-row">
                            <div className="flex h-[52px] min-w-0 flex-1 items-center rounded-[14px] border border-[#D6E1EC] bg-[#F8FAFC] px-3.5 sm:h-[56px] sm:px-4">
                              <Gift size={22} className="shrink-0 text-[#64748B]" />
                              <input
                                type="text"
                                value={giftCardNumber}
                                onChange={(event) => setGiftCardNumber(event.target.value)}
                                placeholder="Enter gift card number"
                                className="h-full min-w-0 w-full bg-transparent px-2.5 text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#94A3B8] sm:px-3 sm:text-[16px]"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleGiftCardBalanceCheck}
                              disabled={processing || !giftCardNumber.trim()}
                              className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#1EA7EE] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#1698DA] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[56px] sm:text-[16px] lg:w-auto lg:min-w-[180px]"
                            >
                              Check Balance
                            </button>
                          </div>

                          <p className="mt-2 text-[12px] text-[#94A3B8]">
                            Test cards:
                            {' '}
                            {STATIC_GIFT_CARD_OPTIONS.map((giftCard) => giftCard.number).join(', ')}
                          </p>

                          {giftCardLookupMessage ? (
                            <p
                              className={[
                                'mt-2 text-[12px] font-medium',
                                giftCardLookupStatus === 'error' ? 'text-rose-500' : 'text-emerald-600',
                              ].join(' ')}
                            >
                              {giftCardLookupMessage}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-5 rounded-[18px] bg-[#F8FAFC] p-4 sm:mt-6 sm:p-5">
                          <h4 className="text-[18px] font-bold leading-6 text-[#0F172A]">Card Details</h4>
                          <div
                            className={[
                              'mt-5 grid gap-5 md:gap-6',
                              hasCheckedGiftCard ? 'md:grid-cols-3' : 'md:grid-cols-2',
                            ].join(' ')}
                          >
                            <div>
                              <p className="text-[14px] leading-5 text-[#64748B]">Current Balance</p>
                              <p className="mt-2 text-[30px] font-bold leading-none text-[#16A34A] sm:text-[36px]">
                                {formatCurrency(numericGiftCardBalance)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[14px] leading-5 text-[#64748B]">Total Due</p>
                              <p className="mt-2 text-[30px] font-bold leading-none text-[#1EA7EE] sm:text-[36px]">
                                {formatCurrency(totalDue)}
                              </p>
                            </div>

                            {hasCheckedGiftCard ? (
                              <div>
                                <p className="text-[14px] leading-5 text-[#64748B]">Remaining to Pay</p>
                                <p className="mt-2 text-[30px] font-bold leading-none text-[#F59E0B] sm:text-[36px]">
                                  {formatCurrency(remainingGiftCardBalanceDue)}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col justify-end gap-3 sm:mt-7 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setActiveStep('methods')}
                            disabled={processing}
                            className="inline-flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#E2E8F0] px-5 text-[15px] font-bold text-[#0F172A] transition-colors hover:bg-[#CBD5E1] disabled:opacity-60 sm:h-[52px] sm:w-auto sm:min-w-[132px] sm:text-[16px]"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={
                              processing
                              || !hasCheckedGiftCard
                              || numericGiftCardAppliedAmount <= 0
                            }
                            onClick={async () => {
                              await onApplyGiftCard({
                                number: giftCardNumber,
                                balance: numericGiftCardBalance,
                                appliedAmount: numericGiftCardAppliedAmount,
                              })
                              setActiveStep('methods')
                            }}
                            className="inline-flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#1EA7EE] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#1698DA] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[52px] sm:w-auto sm:min-w-[230px] sm:text-[16px]"
                          >
                            <span>Apply Payment</span>
                            <ArrowRight size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
            )}
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default PaymentMethodModal
