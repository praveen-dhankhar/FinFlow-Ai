import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test value' })
      })
    )
  })

  it('can be controlled', () => {
    const { rerender } = render(<Input value="initial" />)
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument()

    rerender(<Input value="updated" />)
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('supports different types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('supports required attribute', () => {
    render(<Input required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('supports aria attributes', () => {
    render(
      <Input 
        aria-label="Test input"
        aria-describedby="help-text"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
  })
})
