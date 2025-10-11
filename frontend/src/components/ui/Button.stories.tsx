import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Download, Plus, Settings, Trash2 } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'The content inside the button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different visual variants of the button component.',
      },
    },
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of the button component.',
      },
    },
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons for better visual communication.',
      },
    },
  },
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button className="opacity-50">Loading...</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different states of the button component.',
      },
    },
  },
}

export const Interactive: Story = {
  render: () => {
    const handleClick = () => {
      alert('Button clicked!')
    }

    return (
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleClick}>Click me</Button>
        <Button variant="outline" onClick={handleClick}>
          Outline click
        </Button>
        <Button variant="destructive" onClick={handleClick}>
          Destructive click
        </Button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive buttons with click handlers.',
      },
    },
  },
}

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Processing...
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state buttons with spinner animations.',
      },
    },
  },
}

export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button aria-label="Close dialog">×</Button>
      <Button aria-describedby="help-text">Submit</Button>
      <Button role="menuitem">Menu Item</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with proper accessibility attributes.',
      },
    },
  },
}
