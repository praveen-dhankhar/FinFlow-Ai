# Animation Utilities

This directory contains animation utilities built on top of [Anime.js](https://animejs.com/) for creating smooth, performant animations in the Finance Forecast App.

## 🎨 Available Animations

### Fade Animations
- `fadeIn(targets, options?)` - Fade in from transparent to opaque
- `fadeOut(targets, options?)` - Fade out from opaque to transparent

### Slide Animations
- `slideInUp(targets, options?)` - Slide in from below
- `slideInDown(targets, options?)` - Slide in from above
- `slideInLeft(targets, options?)` - Slide in from the left
- `slideInRight(targets, options?)` - Slide in from the right

### Scale Animations
- `scaleIn(targets, options?)` - Scale in from 0.8 to 1.0
- `scaleOut(targets, options?)` - Scale out from 1.0 to 0.8

### Special Effects
- `bounceIn(targets, options?)` - Bounce in with elastic easing
- `shake(targets, options?)` - Shake horizontally
- `pulse(targets, options?)` - Continuous pulsing effect
- `rotateIn(targets, options?)` - Rotate in from -180 degrees

### Loading & Progress
- `spin(targets, options?)` - Continuous rotation
- `progressBar(targets, progress, options?)` - Animate width to percentage
- `countUp(targets, endValue, options?)` - Count up to a number

### Stagger Effects
- `staggerIn(targets, options?)` - Staggered animation with 100ms delay between elements

### Page Transitions
- `pageTransitionIn(targets)` - Page enter animation
- `pageTransitionOut(targets)` - Page exit animation

### Card Interactions
- `cardHoverIn(targets)` - Card hover enter effect
- `cardHoverOut(targets)` - Card hover exit effect

### Notifications
- `notificationIn(targets)` - Notification slide in from right
- `notificationOut(targets)` - Notification slide out to right

### Modals
- `modalIn(targets)` - Modal enter animation
- `modalOut(targets)` - Modal exit animation

### Timeline Utilities
- `createTimeline(options?)` - Create an anime.js timeline

### Control Functions
- `stopAllAnimations()` - Stop all running animations
- `pauseAllAnimations()` - Pause all running animations
- `resumeAllAnimations()` - Resume all paused animations

## 📖 Usage Examples

### Basic Usage

```tsx
import { fadeIn, slideInUp, scaleIn } from '../utils/animations';

// Fade in an element
fadeIn('.my-element');

// Slide in with custom options
slideInUp('.my-element', {
  duration: 1000,
  delay: 500,
  easing: 'easeInOutQuad'
});

// Scale in with callback
scaleIn('.my-element', {
  complete: () => console.log('Animation complete!')
});
```

### React Component Integration

```tsx
import React, { useRef, useEffect } from 'react';
import { fadeIn, slideInUp } from '../utils/animations';

const MyComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      fadeIn(elementRef.current);
    }
  }, []);

  return (
    <div ref={elementRef} className="opacity-0">
      Content that will fade in
    </div>
  );
};
```

### Staggered Animations

```tsx
import { staggerIn } from '../utils/animations';

// Animate multiple elements with stagger
useEffect(() => {
  const elements = document.querySelectorAll('.list-item');
  staggerIn(elements);
}, []);
```

### Counter Animation

```tsx
import { countUp } from '../utils/animations';

const animateCounter = () => {
  const counterElement = document.querySelector('.counter');
  if (counterElement) {
    countUp(counterElement, 1000); // Count up to 1000
  }
};
```

### Progress Bar

```tsx
import { progressBar } from '../utils/animations';

const animateProgress = (percentage: number) => {
  const progressElement = document.querySelector('.progress-bar');
  if (progressElement) {
    progressBar(progressElement, percentage);
  }
};
```

## ⚙️ Configuration

All animations accept an optional `options` parameter that can override default settings:

```tsx
interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  complete?: () => void;
  // ... other anime.js options
}
```

### Common Options

- `duration`: Animation duration in milliseconds
- `delay`: Delay before animation starts
- `easing`: Easing function (e.g., 'easeInOutQuad', 'easeOutBack')
- `complete`: Callback function when animation completes
- `loop`: Number of times to loop (or true for infinite)

## 🎯 Best Practices

1. **Performance**: Use `transform` and `opacity` properties for smooth animations
2. **Accessibility**: Respect `prefers-reduced-motion` user preference
3. **Timing**: Keep animations under 500ms for UI feedback, longer for page transitions
4. **Easing**: Use appropriate easing functions for natural motion
5. **Cleanup**: Stop animations when components unmount

## 🧪 Testing

The animation utilities are fully tested with mocked anime.js functions:

```bash
npm test src/utils/animations.test.ts
```

## 📚 Dependencies

- [Anime.js](https://animejs.com/) - Lightweight JavaScript animation library
- [TypeScript](https://www.typescriptlang.org/) - Type safety and better development experience

## 🔗 Related

- [Anime.js Documentation](https://animejs.com/documentation/)
- [CSS Animation Best Practices](https://web.dev/animations/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
