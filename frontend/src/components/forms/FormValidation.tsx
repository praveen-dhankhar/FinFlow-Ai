'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

// Validation rules
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface FieldError {
  field: string
  message: string
  type: 'error' | 'warning' | 'info'
}

export interface FormState {
  values: Record<string, any>
  errors: FieldError[]
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// Form validation hook
export function useFormValidation(initialValues: Record<string, any>, validationRules: Record<string, ValidationRule[]>) {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: [],
    touched: {},
    isSubmitting: false,
    isValid: false
  })

  // Validate single field
  const validateField = useCallback((field: string, value: any): string | null => {
    const rules = validationRules[field] || []
    
    for (const rule of rules) {
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return rule.message || `${field} is required`
      }
      
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return rule.message || `${field} must be at least ${rule.minLength} characters`
      }
      
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return rule.message || `${field} must be no more than ${rule.maxLength} characters`
      }
      
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message || `${field} format is invalid`
      }
      
      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) return customError
      }
    }
    
    return null
  }, [validationRules])

  // Validate all fields
  const validateForm = useCallback(() => {
    const errors: FieldError[] = []
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, state.values[field])
      if (error) {
        errors.push({
          field,
          message: error,
          type: 'error'
        })
      }
    })
    
    setState(prev => ({
      ...prev,
      errors,
      isValid: errors.length === 0
    }))
    
    return errors.length === 0
  }, [state.values, validateField, validationRules])

  // Update field value
  const setValue = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      touched: { ...prev.touched, [field]: true }
    }))
  }, [])

  // Set field as touched
  const setTouched = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true }
    }))
  }, [])

  // Set field error
  const setError = useCallback((field: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setState(prev => ({
      ...prev,
      errors: [
        ...prev.errors.filter(e => e.field !== field),
        { field, message, type }
      ]
    }))
  }, [])

  // Clear field error
  const clearError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(e => e.field !== field)
    }))
  }, [])

  // Set submitting state
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }))
  }, [])

  // Reset form
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: [],
      touched: {},
      isSubmitting: false,
      isValid: false
    })
  }, [initialValues])

  // Auto-validate on change
  useEffect(() => {
    if (Object.keys(state.touched).length > 0) {
      validateForm()
    }
  }, [state.values, state.touched, validateForm])

  return {
    ...state,
    setValue,
    setTouched,
    setError,
    clearError,
    setSubmitting,
    reset,
    validateForm
  }
}

// Validated input component
interface ValidatedInputProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  value: any
  error?: FieldError
  touched: boolean
  onChange: (value: any) => void
  onBlur: () => void
  disabled?: boolean
  className?: string
  showPasswordToggle?: boolean
}

export function ValidatedInput({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  touched,
  onChange,
  onBlur,
  disabled,
  className,
  showPasswordToggle = false
}: ValidatedInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type
  const hasError = touched && error
  const isValid = touched && !error && value

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          className={cn(
            'pr-10',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500',
            isFocused && 'ring-2 ring-blue-500/20'
          )}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {isValid && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          
          {hasError && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error?.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Validated textarea component
interface ValidatedTextareaProps {
  name: string
  label: string
  placeholder?: string
  value: any
  error?: FieldError
  touched: boolean
  onChange: (value: any) => void
  onBlur: () => void
  disabled?: boolean
  className?: string
  rows?: number
}

export function ValidatedTextarea({
  name,
  label,
  placeholder,
  value,
  error,
  touched,
  onChange,
  onBlur,
  disabled,
  className,
  rows = 3
}: ValidatedTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = touched && error
  const isValid = touched && !error && value

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="relative">
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          rows={rows}
          className={cn(
            'resize-none',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500',
            isFocused && 'ring-2 ring-blue-500/20'
          )}
        />
        
        <div className="absolute right-3 top-3">
          {isValid && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          
          {hasError && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error?.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Form error summary
interface FormErrorSummaryProps {
  errors: FieldError[]
  className?: string
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  if (errors.length === 0) return null

  const errorCount = errors.filter(e => e.type === 'error').length
  const warningCount = errors.filter(e => e.type === 'warning').length
  const infoCount = errors.filter(e => e.type === 'info').length

  return (
    <Card className={cn('border-red-200 dark:border-red-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <CardTitle className="text-lg text-red-900 dark:text-red-100">
            Please fix the following issues:
          </CardTitle>
        </div>
        <CardDescription className="text-red-700 dark:text-red-300">
          {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
          {warningCount > 0 && `${errorCount > 0 ? ', ' : ''}${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
          {infoCount > 0 && `${errorCount > 0 || warningCount > 0 ? ', ' : ''}${infoCount} note${infoCount !== 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {errors.map((error, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              {error.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
              {error.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
              {error.type === 'info' && <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />}
              
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  error.type === 'error' && 'text-red-900 dark:text-red-100',
                  error.type === 'warning' && 'text-yellow-900 dark:text-yellow-100',
                  error.type === 'info' && 'text-blue-900 dark:text-blue-100'
                )}>
                  {error.field}
                </p>
                <p className={cn(
                  'text-sm',
                  error.type === 'error' && 'text-red-700 dark:text-red-300',
                  error.type === 'warning' && 'text-yellow-700 dark:text-yellow-300',
                  error.type === 'info' && 'text-blue-700 dark:text-blue-300'
                )}>
                  {error.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Submit button with loading state
interface SubmitButtonProps {
  isSubmitting: boolean
  isValid: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function SubmitButton({ isSubmitting, isValid, children, className, disabled }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isSubmitting || !isValid}
      className={cn('min-w-[120px]', className)}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
