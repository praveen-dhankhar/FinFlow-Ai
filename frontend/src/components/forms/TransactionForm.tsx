'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Tag, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  useFormValidation, 
  ValidatedInput, 
  ValidatedTextarea, 
  FormErrorSummary, 
  SubmitButton,
  type ValidationRule 
} from '@/components/error'
import { errorReporting } from '@/lib/error-reporting'

interface TransactionFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: any
  onCancel?: () => void
  className?: string
}

export function TransactionForm({ onSubmit, initialData, onCancel, className }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Validation rules
  const validationRules: Record<string, ValidationRule[]> = {
    amount: [
      { required: true, message: 'Amount is required' },
      { 
        custom: (value) => {
          const num = parseFloat(value)
          if (isNaN(num) || num <= 0) {
            return 'Amount must be a positive number'
          }
          return null
        }
      }
    ],
    description: [
      { required: true, message: 'Description is required' },
      { minLength: 3, message: 'Description must be at least 3 characters' },
      { maxLength: 100, message: 'Description must be no more than 100 characters' }
    ],
    category: [
      { required: true, message: 'Category is required' }
    ],
    date: [
      { required: true, message: 'Date is required' },
      {
        custom: (value) => {
          const date = new Date(value)
          if (isNaN(date.getTime())) {
            return 'Please enter a valid date'
          }
          if (date > new Date()) {
            return 'Date cannot be in the future'
          }
          return null
        }
      }
    ],
    type: [
      { required: true, message: 'Transaction type is required' }
    ]
  }

  const {
    values,
    errors,
    touched,
    isSubmitting: formIsSubmitting,
    isValid,
    setValue,
    setTouched,
    setError,
    setSubmitting,
    reset
  } = useFormValidation(
    initialData || {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      notes: ''
    },
    validationRules
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      setError('form', 'Please fix the errors above', 'error')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Track form submission
      errorReporting.addBreadcrumb('form', 'Transaction form submitted', 'info', {
        type: values.type,
        amount: values.amount
      })

      await onSubmit(values)
      
      // Reset form on success
      reset()
      
      // Track successful submission
      errorReporting.addBreadcrumb('form', 'Transaction created successfully', 'info')
      
    } catch (error) {
      console.error('Form submission error:', error)
      
      // Report error
      errorReporting.reportError(error as Error, {
        form: 'transaction',
        values: values
      })
      
      setSubmitError(error instanceof Error ? error.message : 'Failed to create transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setValue(field, value)
    setError('form', '', 'error') // Clear form-level error
  }

  const handleFieldBlur = (field: string) => {
    setTouched(field)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </CardTitle>
        <CardDescription>
          Enter the details of your transaction
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Error Summary */}
          {errors.length > 0 && (
            <FormErrorSummary errors={errors} />
          )}

          {/* Submit Error */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <ValidatedInput
              name="amount"
              label="Amount"
              type="number"
              placeholder="0.00"
              value={values.amount}
              error={errors.find(e => e.field === 'amount')}
              touched={touched.amount}
              onChange={(value) => handleFieldChange('amount', value)}
              onBlur={() => handleFieldBlur('amount')}
            />

            {/* Date */}
            <ValidatedInput
              name="date"
              label="Date"
              type="date"
              value={values.date}
              error={errors.find(e => e.field === 'date')}
              touched={touched.date}
              onChange={(value) => handleFieldChange('date', value)}
              onBlur={() => handleFieldBlur('date')}
            />
          </div>

          {/* Description */}
          <ValidatedInput
            name="description"
            label="Description"
            placeholder="What was this transaction for?"
            value={values.description}
            error={errors.find(e => e.field === 'description')}
            touched={touched.description}
            onChange={(value) => handleFieldChange('description', value)}
            onBlur={() => handleFieldBlur('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={values.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                onBlur={() => handleFieldBlur('category')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                <option value="food">Food & Dining</option>
                <option value="transport">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills & Utilities</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
              {touched.category && errors.find(e => e.field === 'category') && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.find(e => e.field === 'category')?.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={values.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                onBlur={() => handleFieldBlur('type')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
              {touched.type && errors.find(e => e.field === 'type') && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.find(e => e.field === 'type')?.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <ValidatedTextarea
            name="notes"
            label="Notes (Optional)"
            placeholder="Add any additional notes about this transaction..."
            value={values.notes}
            error={errors.find(e => e.field === 'notes')}
            touched={touched.notes}
            onChange={(value) => handleFieldChange('notes', value)}
            onBlur={() => handleFieldBlur('notes')}
          />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <SubmitButton
              isSubmitting={isSubmitting || formIsSubmitting}
              isValid={isValid}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              {initialData ? 'Update Transaction' : 'Add Transaction'}
            </SubmitButton>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
