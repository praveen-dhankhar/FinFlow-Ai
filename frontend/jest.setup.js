import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor() {
      this.url = 'http://localhost:3000'
      this.method = 'GET'
      this.headers = new Map()
    }
  },
  NextResponse: {
    json: jest.fn((data) => ({ json: () => data })),
    redirect: jest.fn((url) => ({ redirect: () => url })),
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    label: 'label',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    ul: 'ul',
    li: 'li',
    nav: 'nav',
    header: 'header',
    main: 'main',
    section: 'section',
    article: 'article',
    aside: 'aside',
    footer: 'footer',
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
  useMotionValue: () => ({ get: jest.fn(), set: jest.fn() }),
  useTransform: () => ({ get: jest.fn(), set: jest.fn() }),
}))

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
}))

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}))

// Mock papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn((file, options) => {
    options.complete({
      data: [
        { date: '2024-01-01', description: 'Test', amount: '100', category: 'Food', type: 'EXPENSE' },
      ],
    })
  }),
}))

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock performance.now
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
}

// Mock Request and Response for Node.js environment
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Map()
    this.body = options.body
  }
}

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.headers = new Map()
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body))
  }
  
  text() {
    return Promise.resolve(this.body)
  }
}

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0))
global.cancelAnimationFrame = jest.fn()

// Suppress console warnings in tests
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }

  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Error: Could not parse CSS'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})
