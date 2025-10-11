import { render, screen, fireEvent, waitFor } from '@/test-utils/test-utils'
import { useFormValidation, ValidatedInput, FormErrorSummary } from '@/components/error'
import { Button } from '@/components/ui/Button'

// Test component that uses the form validation hook
function TestForm() {
  const validationRules = {
    email: [
      { required: true, message: 'Email is required' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    ],
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' }
    ],
    confirmPassword: [
      { required: true, message: 'Confirm password is required' },
      { custom: (value: string, values: any) => 
        value !== values.password ? 'Passwords do not match' : null
      }
    ]
  }

  const {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    setError,
    validateForm
  } = useFormValidation(
    { email: '', password: '', confirmPassword: '' },
    validationRules
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Form is valid:', values)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        name="email"
        label="Email"
        type="email"
        value={values.email}
        error={errors.find(e => e.field === 'email')}
        touched={touched.email}
        onChange={(value) => setValue('email', value)}
        onBlur={() => setTouched('email')}
      />

      <ValidatedInput
        name="password"
        label="Password"
        type="password"
        value={values.password}
        error={errors.find(e => e.field === 'password')}
        touched={touched.password}
        onChange={(value) => setValue('password', value)}
        onBlur={() => setTouched('password')}
      />

      <ValidatedInput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        value={values.confirmPassword}
        error={errors.find(e => e.field === 'confirmPassword')}
        touched={touched.confirmPassword}
        onChange={(value) => setValue('confirmPassword', value)}
        onBlur={() => setTouched('confirmPassword')}
      />

      {errors.length > 0 && <FormErrorSummary errors={errors} />}

      <Button type="submit" disabled={!isValid}>
        Submit
      </Button>
    </form>
  )
}

describe('Form Validation', () => {
  it('renders form with validation inputs', () => {
    render(<TestForm />)
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(<TestForm />)
    
    const emailInput = screen.getByLabelText('Email')
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('shows validation errors for invalid email format', async () => {
    render(<TestForm />)
    
    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })
  })

  it('shows validation errors for password length', async () => {
    render(<TestForm />)
    
    const passwordInput = screen.getByLabelText('Password')
    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.blur(passwordInput)
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('shows validation errors for password mismatch', async () => {
    render(<TestForm />)
    
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } })
    fireEvent.blur(confirmPasswordInput)
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('enables submit button when form is valid', async () => {
    render(<TestForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    
    // Initially disabled
    expect(submitButton).toBeDisabled()
    
    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows error summary when there are errors', async () => {
    render(<TestForm />)
    
    const emailInput = screen.getByLabelText('Email')
    fireEvent.blur(emailInput)
    
    await waitFor(() => {
      expect(screen.getByText('Please fix the following issues:')).toBeInTheDocument()
    })
  })

  it('clears errors when valid input is provided', async () => {
    render(<TestForm />)
    
    const emailInput = screen.getByLabelText('Email')
    
    // Trigger error
    fireEvent.blur(emailInput)
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
    
    // Provide valid input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })
  })
})
