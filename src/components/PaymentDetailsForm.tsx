import React, { useState } from 'react'

type PaymentDetails = {
  payment_type: 'upi' | 'bank'
  upi_id?: string
  bank_name?: string
  account_number?: string
  ifsc_code?: string
}

interface PaymentDetailsFormProps {
  onSubmit: (data: PaymentDetails) => void
  onCancel: () => void
  isSubmitting: boolean
  initialData?: PaymentDetails | null
}

export default function PaymentDetailsForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: PaymentDetailsFormProps) {
  const [paymentType, setPaymentType] = useState<'upi' | 'bank'>(
    initialData?.payment_type || 'upi'
  )
  const [formData, setFormData] = useState<PaymentDetails>({
    payment_type: initialData?.payment_type || 'upi',
    upi_id: initialData?.upi_id || '',
    bank_name: initialData?.bank_name || '',
    account_number: initialData?.account_number || '',
    ifsc_code: initialData?.ifsc_code || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Payment Method</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setPaymentType('upi')
              setFormData(prev => ({ ...prev, payment_type: 'upi' }))
            }}
            className={`px-4 py-2 rounded ${
              paymentType === 'upi'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            UPI
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentType('bank')
              setFormData(prev => ({ ...prev, payment_type: 'bank' }))
            }}
            className={`px-4 py-2 rounded ${
              paymentType === 'bank'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Bank Transfer
          </button>
        </div>
      </div>

      {paymentType === 'upi' ? (
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">UPI ID</label>
          <input
            type="text"
            value={formData.upi_id || ''}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, upi_id: e.target.value }))
            }
            className="w-full bg-gray-800 text-white rounded px-3 py-2"
            placeholder="Enter your UPI ID"
            required
          />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Bank Name</label>
            <input
              type="text"
              value={formData.bank_name || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, bank_name: e.target.value }))
              }
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              placeholder="Enter bank name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Account Number</label>
            <input
              type="text"
              value={formData.account_number || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, account_number: e.target.value }))
              }
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              placeholder="Enter account number"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">IFSC Code</label>
            <input
              type="text"
              value={formData.ifsc_code || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, ifsc_code: e.target.value }))
              }
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              placeholder="Enter IFSC code"
              required
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </form>
  )
} 