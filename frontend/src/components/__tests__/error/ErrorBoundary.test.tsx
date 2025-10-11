import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that throws an error on button click
function ThrowErrorOnClick() {
  const handleClick = () => {
    throw new Error('Button click error')
  }

  return <button onClick={handleClick}>Throw Error</button>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error fallback when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We encountered an unexpected error. Don\'t worry, your data is safe.')).toBeInTheDocument()
  })

  it('renders page-level error fallback by default', () => {
    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to Dashboard' })).toBeInTheDocument()
  })

  it('renders section-level error fallback', () => {
    render(
      <ErrorBoundary level="section">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Failed to load section')).toBeInTheDocument()
    expect(screen.getByText('This section couldn\'t be loaded. Your other data is still available.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('renders component-level error fallback', () => {
    render(
      <ErrorBoundary level="component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Component Error')).toBeInTheDocument()
    expect(screen.getByText('This component failed to load properly.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('handles retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    const retryButton = screen.getByRole('button', { name: 'Try Again' })
    fireEvent.click(retryButton)
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('handles reload functionality', () => {
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const reloadButton = screen.getByRole('button', { name: 'Reload Page' })
    fireEvent.click(reloadButton)
    
    expect(mockReload).toHaveBeenCalled()
  })

  it('handles go home functionality', () => {
    const mockAssign = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '', assign: mockAssign },
      writable: true,
    })
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const goHomeButton = screen.getByRole('button', { name: 'Go to Dashboard' })
    fireEvent.click(goHomeButton)
    
    expect(mockAssign).toHaveBeenCalledWith('/dashboard')
  })

  it('handles report bug functionality', () => {
    const mockOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    })
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const reportBugButton = screen.getByRole('button', { name: 'Report Bug' })
    fireEvent.click(reportBugButton)
    
    expect(mockOpen).toHaveBeenCalled()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error Details')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('handles errors thrown in event handlers', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorOnClick />
      </ErrorBoundary>
    )
    
    const button = screen.getByRole('button', { name: 'Throw Error' })
    fireEvent.click(button)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
