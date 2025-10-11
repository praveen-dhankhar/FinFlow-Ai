import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component with various types, states, and validation support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Text Input</label>
        <Input type="text" placeholder="Enter text..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email Input</label>
        <Input type="email" placeholder="Enter email..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Password Input</label>
        <Input type="password" placeholder="Enter password..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Number Input</label>
        <Input type="number" placeholder="Enter number..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Search Input</label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types for various use cases.',
      },
    },
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-10" placeholder="Search..." />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-10" type="email" placeholder="Email address..." />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-10" type="password" placeholder="Password..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with icons for better visual context.',
      },
    },
  },
}

export const PasswordWithToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative w-80">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password..."
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Password input with show/hide toggle functionality.',
      },
    },
  },
}

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Normal</label>
        <Input placeholder="Normal state..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Disabled</label>
        <Input disabled placeholder="Disabled state..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Required</label>
        <Input required placeholder="Required field..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">With Value</label>
        <Input defaultValue="Pre-filled value" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different states of the input component.',
      },
    },
  },
}

export const Validation: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Valid Input</label>
        <Input className="border-green-500 focus:border-green-500 focus:ring-green-500" />
        <p className="text-sm text-green-600 mt-1">✓ Valid input</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Invalid Input</label>
        <Input className="border-red-500 focus:border-red-500 focus:ring-red-500" />
        <p className="text-sm text-red-600 mt-1">✗ Invalid input</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Warning Input</label>
        <Input className="border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500" />
        <p className="text-sm text-yellow-600 mt-1">⚠ Warning message</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input validation states with appropriate styling.',
      },
    },
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Small</label>
        <Input className="h-8 text-sm" placeholder="Small input..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Default</label>
        <Input placeholder="Default input..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Large</label>
        <Input className="h-12 text-lg" placeholder="Large input..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of the input component.',
      },
    },
  },
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">First Name</label>
        <Input placeholder="Enter your first name..." required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Last Name</label>
        <Input placeholder="Enter your last name..." required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input type="email" placeholder="Enter your email..." required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <Input type="tel" placeholder="Enter your phone number..." />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
        Submit
      </button>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete form example with multiple input types.',
      },
    },
  },
}

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label htmlFor="accessible-input" className="block text-sm font-medium mb-2">
          Accessible Input
        </label>
        <Input
          id="accessible-input"
          aria-describedby="help-text"
          placeholder="Enter text..."
        />
        <p id="help-text" className="text-sm text-gray-500 mt-1">
          This input has proper accessibility attributes.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with proper accessibility attributes and labels.',
      },
    },
  },
}
