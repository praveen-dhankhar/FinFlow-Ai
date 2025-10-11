import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { 
  EmptyState,
  EmptyTransactions,
  EmptyCategories,
  EmptyGoals,
  EmptyBudgets,
  EmptyAnalytics,
  EmptyForecasts,
  EmptySearch,
  Onboarding
} from '@/components/error'

describe('Empty States', () => {
  describe('EmptyState', () => {
    const mockIcon = () => <div data-testid="icon">Icon</div>
    const mockAction = jest.fn()
    const mockSecondaryAction = jest.fn()

    beforeEach(() => {
      mockAction.mockClear()
      mockSecondaryAction.mockClear()
    })

    it('renders with basic props', () => {
      render(
        <EmptyState
          title="Test Title"
          description="Test description"
          icon={mockIcon}
        />
      )
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('renders with action button', () => {
      render(
        <EmptyState
          title="Test Title"
          description="Test description"
          icon={mockIcon}
          action={{
            label: 'Test Action',
            onClick: mockAction
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: 'Test Action' })
      expect(button).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(mockAction).toHaveBeenCalled()
    })

    it('renders with secondary action button', () => {
      render(
        <EmptyState
          title="Test Title"
          description="Test description"
          icon={mockIcon}
          secondaryAction={{
            label: 'Secondary Action',
            onClick: mockSecondaryAction
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: 'Secondary Action' })
      expect(button).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(mockSecondaryAction).toHaveBeenCalled()
    })

    it('renders with tips', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3']
      
      render(
        <EmptyState
          title="Test Title"
          description="Test description"
          icon={mockIcon}
          tips={tips}
        />
      )
      
      expect(screen.getByText('Quick Tips')).toBeInTheDocument()
      tips.forEach(tip => {
        expect(screen.getByText(tip)).toBeInTheDocument()
      })
    })

    it('applies custom className', () => {
      render(
        <EmptyState
          title="Test Title"
          description="Test description"
          icon={mockIcon}
          className="custom-class"
        />
      )
      
      expect(screen.getByTestId('empty-state')).toHaveClass('custom-class')
    })
  })

  describe('EmptyTransactions', () => {
    const mockOnAddTransaction = jest.fn()
    const mockOnImport = jest.fn()

    beforeEach(() => {
      mockOnAddTransaction.mockClear()
      mockOnImport.mockClear()
    })

    it('renders with correct content', () => {
      render(
        <EmptyTransactions
          onAddTransaction={mockOnAddTransaction}
          onImport={mockOnImport}
        />
      )
      
      expect(screen.getByText('No transactions yet')).toBeInTheDocument()
      expect(screen.getByText('Start tracking your finances by adding your first transaction. You can also import data from other apps.')).toBeInTheDocument()
    })

    it('handles add transaction action', () => {
      render(
        <EmptyTransactions
          onAddTransaction={mockOnAddTransaction}
          onImport={mockOnImport}
        />
      )
      
      const addButton = screen.getByRole('button', { name: 'Add Transaction' })
      fireEvent.click(addButton)
      
      expect(mockOnAddTransaction).toHaveBeenCalled()
    })

    it('handles import action', () => {
      render(
        <EmptyTransactions
          onAddTransaction={mockOnAddTransaction}
          onImport={mockOnImport}
        />
      )
      
      const importButton = screen.getByRole('button', { name: 'Import Data' })
      fireEvent.click(importButton)
      
      expect(mockOnImport).toHaveBeenCalled()
    })
  })

  describe('EmptyCategories', () => {
    const mockOnCreateCategory = jest.fn()

    beforeEach(() => {
      mockOnCreateCategory.mockClear()
    })

    it('renders with correct content', () => {
      render(<EmptyCategories onCreateCategory={mockOnCreateCategory} />)
      
      expect(screen.getByText('No categories yet')).toBeInTheDocument()
      expect(screen.getByText('Create spending categories to organize your transactions and get better insights into your finances.')).toBeInTheDocument()
    })

    it('handles create category action', () => {
      render(<EmptyCategories onCreateCategory={mockOnCreateCategory} />)
      
      const createButton = screen.getByRole('button', { name: 'Create Category' })
      fireEvent.click(createButton)
      
      expect(mockOnCreateCategory).toHaveBeenCalled()
    })
  })

  describe('EmptyGoals', () => {
    const mockOnCreateGoal = jest.fn()

    beforeEach(() => {
      mockOnCreateGoal.mockClear()
    })

    it('renders with correct content', () => {
      render(<EmptyGoals onCreateGoal={mockOnCreateGoal} />)
      
      expect(screen.getByText('No financial goals yet')).toBeInTheDocument()
      expect(screen.getByText('Set financial goals to stay motivated and track your progress towards important milestones.')).toBeInTheDocument()
    })

    it('handles create goal action', () => {
      render(<EmptyGoals onCreateGoal={mockOnCreateGoal} />)
      
      const createButton = screen.getByRole('button', { name: 'Create Goal' })
      fireEvent.click(createButton)
      
      expect(mockOnCreateGoal).toHaveBeenCalled()
    })
  })

  describe('EmptyBudgets', () => {
    const mockOnCreateBudget = jest.fn()

    beforeEach(() => {
      mockOnCreateBudget.mockClear()
    })

    it('renders with correct content', () => {
      render(<EmptyBudgets onCreateBudget={mockOnCreateBudget} />)
      
      expect(screen.getByText('No budgets yet')).toBeInTheDocument()
      expect(screen.getByText('Create budgets to plan your spending and avoid overspending in important categories.')).toBeInTheDocument()
    })

    it('handles create budget action', () => {
      render(<EmptyBudgets onCreateBudget={mockOnCreateBudget} />)
      
      const createButton = screen.getByRole('button', { name: 'Create Budget' })
      fireEvent.click(createButton)
      
      expect(mockOnCreateBudget).toHaveBeenCalled()
    })
  })

  describe('EmptyAnalytics', () => {
    const mockOnAddData = jest.fn()

    beforeEach(() => {
      mockOnAddData.mockClear()
    })

    it('renders with correct content', () => {
      render(<EmptyAnalytics onAddData={mockOnAddData} />)
      
      expect(screen.getByText('No data to analyze yet')).toBeInTheDocument()
      expect(screen.getByText('Add some transactions and categories to see detailed analytics and insights about your finances.')).toBeInTheDocument()
    })

    it('handles add data action', () => {
      render(<EmptyAnalytics onAddData={mockOnAddData} />)
      
      const addButton = screen.getByRole('button', { name: 'Add Data' })
      fireEvent.click(addButton)
      
      expect(mockOnAddData).toHaveBeenCalled()
    })
  })

  describe('EmptyForecasts', () => {
    const mockOnGenerateForecast = jest.fn()

    beforeEach(() => {
      mockOnGenerateForecast.mockClear()
    })

    it('renders with correct content', () => {
      render(<EmptyForecasts onGenerateForecast={mockOnGenerateForecast} />)
      
      expect(screen.getByText('No forecasts available')).toBeInTheDocument()
      expect(screen.getByText('Generate financial forecasts to predict your future financial position and plan accordingly.')).toBeInTheDocument()
    })

    it('handles generate forecast action', () => {
      render(<EmptyForecasts onGenerateForecast={mockOnGenerateForecast} />)
      
      const generateButton = screen.getByRole('button', { name: 'Generate Forecast' })
      fireEvent.click(generateButton)
      
      expect(mockOnGenerateForecast).toHaveBeenCalled()
    })
  })

  describe('EmptySearch', () => {
    const mockOnClearSearch = jest.fn()

    beforeEach(() => {
      mockOnClearSearch.mockClear()
    })

    it('renders with correct content', () => {
      render(
        <EmptySearch
          query="test query"
          onClearSearch={mockOnClearSearch}
        />
      )
      
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(screen.getByText('We couldn\'t find anything matching "test query". Try different keywords or check your spelling.')).toBeInTheDocument()
    })

    it('handles clear search action', () => {
      render(
        <EmptySearch
          query="test query"
          onClearSearch={mockOnClearSearch}
        />
      )
      
      const clearButton = screen.getByRole('button', { name: 'Clear Search' })
      fireEvent.click(clearButton)
      
      expect(mockOnClearSearch).toHaveBeenCalled()
    })
  })

  describe('Onboarding', () => {
    const mockOnComplete = jest.fn()
    const mockSteps = [
      {
        title: 'Step 1',
        description: 'First step',
        icon: () => <div data-testid="step1-icon">Icon</div>,
        action: { label: 'Start', onClick: jest.fn() },
        completed: false
      },
      {
        title: 'Step 2',
        description: 'Second step',
        icon: () => <div data-testid="step2-icon">Icon</div>,
        action: { label: 'Continue', onClick: jest.fn() },
        completed: true
      }
    ]

    beforeEach(() => {
      mockOnComplete.mockClear()
    })

    it('renders onboarding steps', () => {
      render(
        <Onboarding
          steps={mockSteps}
          onComplete={mockOnComplete}
        />
      )
      
      expect(screen.getByText('Get Started')).toBeInTheDocument()
      expect(screen.getByText('Complete these steps to set up your financial tracking')).toBeInTheDocument()
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('shows progress badge', () => {
      render(
        <Onboarding
          steps={mockSteps}
          onComplete={mockOnComplete}
        />
      )
      
      expect(screen.getByText('1/2 Complete')).toBeInTheDocument()
    })

    it('shows completed steps differently', () => {
      render(
        <Onboarding
          steps={mockSteps}
          onComplete={mockOnComplete}
        />
      )
      
      // Step 2 should show as completed
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('shows completion message when all steps done', () => {
      const completedSteps = mockSteps.map(step => ({ ...step, completed: true }))
      
      render(
        <Onboarding
          steps={completedSteps}
          onComplete={mockOnComplete}
        />
      )
      
      expect(screen.getByText('Great job! You\'ve completed the setup.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue to Dashboard' })).toBeInTheDocument()
    })

    it('handles completion action', () => {
      const completedSteps = mockSteps.map(step => ({ ...step, completed: true }))
      
      render(
        <Onboarding
          steps={completedSteps}
          onComplete={mockOnComplete}
        />
      )
      
      const continueButton = screen.getByRole('button', { name: 'Continue to Dashboard' })
      fireEvent.click(continueButton)
      
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })
})
