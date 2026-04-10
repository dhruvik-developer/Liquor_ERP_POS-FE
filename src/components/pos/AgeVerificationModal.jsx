import { useEffect, useRef, useState } from 'react'
import { Camera, IdCard, ShieldAlert } from 'lucide-react'

const initialFormState = {
  day: '',
  month: '',
  year: '',
}

const getLegalDrinkingCutoff = () => {
  const today = new Date()
  return new Date(today.getFullYear() - 21, today.getMonth(), today.getDate())
}

const isValidDateOfBirth = ({ day, month, year }) => {
  const numericDay = Number(day)
  const numericMonth = Number(month)
  const numericYear = Number(year)

  if (!numericMonth || !numericDay || String(year).length !== 4) {
    return {
      isValid: false,
      message: 'Please enter a valid date of birth.',
    }
  }

  const dateOfBirth = new Date(numericYear, numericMonth - 1, numericDay)
  const isSameDate = (
    dateOfBirth.getFullYear() === numericYear
    && dateOfBirth.getMonth() === numericMonth - 1
    && dateOfBirth.getDate() === numericDay
  )

  if (!isSameDate) {
    return {
      isValid: false,
      message: 'Please enter a valid date of birth.',
    }
  }

  if (dateOfBirth > getLegalDrinkingCutoff()) {
    return {
      isValid: false,
      message: 'Customer must be at least 21 years old.',
    }
  }

  return {
    isValid: true,
    value: `${String(numericYear).padStart(4, '0')}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`,
  }
}

const formatDigits = (value, maxLength) => value.replace(/\D/g, '').slice(0, maxLength)

const VerificationActionButton = ({
  icon: Icon,
  label,
  isSelected = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-[64px] items-center justify-center gap-3 rounded-[18px] border text-[18px] font-[800] tracking-[-0.02em] transition-colors ${
      isSelected
        ? 'border-[#1EA7EE] bg-[#EEF8FE] text-[#0F172A]'
        : 'border-[#E7EDF5] bg-[#F4F7FB] text-[#1F2937] hover:border-[#D5E2F0]'
    }`}
  >
    <Icon size={24} strokeWidth={2.2} />
    <span>{label}</span>
  </button>
)

const AgeVerificationModal = ({
  isOpen,
  onCancel,
  onVerify,
}) => {
  const [formValues, setFormValues] = useState(initialFormState)
  const [selectedMethod, setSelectedMethod] = useState('manual')
  const [error, setError] = useState('')
  const dayInputRef = useRef(null)
  const monthInputRef = useRef(null)
  const yearInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setFormValues(initialFormState)
      setSelectedMethod('manual')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFieldChange = (field, maxLength) => (event) => {
    const nextValue = formatDigits(event.target.value, maxLength)
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: nextValue,
    }))
    setError('')

    if (nextValue.length !== maxLength) return

    if (field === 'day') {
      monthInputRef.current?.focus()
      monthInputRef.current?.select()
      return
    }

    if (field === 'month') {
      yearInputRef.current?.focus()
      yearInputRef.current?.select()
    }
  }

  const handleVerify = () => {
    const validationResult = isValidDateOfBirth(formValues)

    if (!validationResult.isValid) {
      setError(validationResult.message)
      return
    }

    onVerify({
      dateOfBirth: validationResult.value,
      method: selectedMethod,
    })
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[rgba(15,23,42,0.46)] backdrop-blur-[4px]" />

      <div className="relative w-full max-w-[680px] rounded-[28px] bg-white px-10 py-9 shadow-[0_35px_90px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#FFF6E8] text-[#F59E0B]">
            <ShieldAlert size={34} strokeWidth={2.1} />
          </div>

          <h2 className="mt-5 text-[26px] font-[900] tracking-[-0.03em] text-[#0F172A]">
            Age Verification Required
          </h2>
          <p className="mt-3 max-w-[520px] text-[17px] font-[500] leading-8 text-[#71829A]">
            This item requires age verification. Please verify the customer is of legal drinking age.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-[15px] font-[700] text-[#64748B]">Enter Date of Birth</p>

          <div className="mt-3 grid grid-cols-3 gap-4">
            <input
              ref={dayInputRef}
              type="text"
              inputMode="numeric"
              value={formValues.day}
              onChange={handleFieldChange('day', 2)}
              placeholder="DD"
              className="h-[64px] rounded-[18px] border border-[#DCE5EF] bg-[#FBFDFF] px-5 text-center text-[20px] font-[700] tracking-[0.06em] text-[#1F2937] outline-none transition-colors placeholder:text-[#9AA7B8] focus:border-[#1EA7EE]"
            />
            <input
              ref={monthInputRef}
              type="text"
              inputMode="numeric"
              value={formValues.month}
              onChange={handleFieldChange('month', 2)}
              placeholder="MM"
              className="h-[64px] rounded-[18px] border border-[#DCE5EF] bg-[#FBFDFF] px-5 text-center text-[20px] font-[700] tracking-[0.06em] text-[#1F2937] outline-none transition-colors placeholder:text-[#9AA7B8] focus:border-[#1EA7EE]"
            />
            <input
              ref={yearInputRef}
              type="text"
              inputMode="numeric"
              value={formValues.year}
              onChange={handleFieldChange('year', 4)}
              placeholder="YYYY"
              className="h-[64px] rounded-[18px] border border-[#DCE5EF] bg-[#FBFDFF] px-5 text-center text-[20px] font-[700] tracking-[0.06em] text-[#1F2937] outline-none transition-colors placeholder:text-[#9AA7B8] focus:border-[#1EA7EE]"
            />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <VerificationActionButton
              icon={IdCard}
              label="Scan ID"
              isSelected={selectedMethod === 'scan_id'}
              onClick={() => setSelectedMethod('scan_id')}
            />
            <VerificationActionButton
              icon={Camera}
              label="Capture Photo"
              isSelected={selectedMethod === 'capture_photo'}
              onClick={() => setSelectedMethod('capture_photo')}
            />
          </div>

          <div className="mt-8 border-t border-[#E8EEF5] pt-7">
            {error ? (
              <p className="mb-4 text-center text-[14px] font-[700] text-rose-600">{error}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="h-[64px] rounded-[18px] bg-[#E8EEF5] text-[19px] font-[800] tracking-[-0.02em] text-[#1F2937] transition-colors hover:bg-[#DDE6F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                className="h-[64px] rounded-[18px] bg-[#1EA7EE] text-[19px] font-[800] tracking-[-0.02em] text-white transition-colors hover:bg-[#1597D9]"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgeVerificationModal
