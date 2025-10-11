import { render, screen } from '@/test-utils/test-utils'
import { 
  AnimatedSkeleton,
  DashboardSkeleton,
  TransactionsSkeleton,
  CategoriesSkeleton,
  GoalsSkeleton,
  ChartSkeleton,
  TableSkeleton,
  ProgressiveLoading,
  LoadingSpinner,
  LoadingOverlay
} from '@/components/error'

describe('Loading States', () => {
  describe('AnimatedSkeleton', () => {
    it('renders with default props', () => {
      render(<AnimatedSkeleton />)
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<AnimatedSkeleton className="custom-class" />)
      expect(screen.getByTestId('skeleton')).toHaveClass('custom-class')
    })

    it('can disable animation', () => {
      render(<AnimatedSkeleton animate={false} />)
      expect(screen.getByTestId('skeleton')).not.toHaveClass('animate-pulse')
    })
  })

  describe('DashboardSkeleton', () => {
    it('renders dashboard skeleton structure', () => {
      render(<DashboardSkeleton />)
      
      // Check for header elements
      expect(screen.getAllByTestId('skeleton')).toHaveLength(6) // Header + 4 stats + 2 charts
    })
  })

  describe('TransactionsSkeleton', () => {
    it('renders transactions skeleton structure', () => {
      render(<TransactionsSkeleton />)
      
      // Check for table structure
      expect(screen.getAllByTestId('skeleton')).toHaveLength(7) // Header + filters + 5 rows
    })
  })

  describe('CategoriesSkeleton', () => {
    it('renders categories skeleton structure', () => {
      render(<CategoriesSkeleton />)
      
      // Check for grid structure
      expect(screen.getAllByTestId('skeleton')).toHaveLength(8) // Header + button + 6 cards
    })
  })

  describe('GoalsSkeleton', () => {
    it('renders goals skeleton structure', () => {
      render(<GoalsSkeleton />)
      
      // Check for grid structure
      expect(screen.getAllByTestId('skeleton')).toHaveLength(6) // Header + button + 4 cards
    })
  })

  describe('ChartSkeleton', () => {
    it('renders chart skeleton with default height', () => {
      render(<ChartSkeleton />)
      
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('renders chart skeleton with custom height', () => {
      render(<ChartSkeleton height={400} />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle({ height: '400px' })
    })
  })

  describe('TableSkeleton', () => {
    it('renders table skeleton with default props', () => {
      render(<TableSkeleton />)
      
      // Check for table structure (header + 5 rows)
      expect(screen.getAllByTestId('skeleton')).toHaveLength(6)
    })

    it('renders table skeleton with custom rows and columns', () => {
      render(<TableSkeleton rows={3} columns={2} />)
      
      // Check for table structure (header + 3 rows)
      expect(screen.getAllByTestId('skeleton')).toHaveLength(4)
    })
  })

  describe('ProgressiveLoading', () => {
    it('renders skeleton when loading', () => {
      render(
        <ProgressiveLoading
          isLoading={true}
          skeleton={<div data-testid="loading-skeleton">Loading...</div>}
        >
          <div data-testid="content">Content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })

    it('renders content when not loading', () => {
      render(
        <ProgressiveLoading
          isLoading={false}
          skeleton={<div data-testid="loading-skeleton">Loading...</div>}
        >
          <div data-testid="content">Content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ProgressiveLoading
          isLoading={true}
          skeleton={<div>Loading...</div>}
          className="custom-class"
        >
          <div>Content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.getByTestId('progressive-loading')).toHaveClass('custom-class')
    })
  })

  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('w-6 h-6')
    })

    it('renders with small size', () => {
      render(<LoadingSpinner size="sm" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('w-4 h-4')
    })

    it('renders with large size', () => {
      render(<LoadingSpinner size="lg" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('w-8 h-8')
    })

    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-class" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('custom-class')
    })
  })

  describe('LoadingOverlay', () => {
    it('renders overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading data...">
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('does not render overlay when not loading', () => {
      render(
        <LoadingOverlay isLoading={false} message="Loading data...">
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('renders with default message', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})
