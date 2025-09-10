import React, { useRef, useEffect } from 'react';
import {
  fadeIn,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  bounceIn,
  shake,
  pulse,
  spin,
  countUp,
  staggerIn,
} from '../utils/animations';
import AnimatedCard from '../components/AnimatedCard';
import Button from '../components/Button';

const AnimationDemo: React.FC = () => {
  const counterRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const staggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger a quick entrance so the page isn't blank on first load
    fadeIn('.fade-target');
    slideInUp('.slide-up-target');
    slideInDown('.slide-down-target');
    slideInLeft('.slide-left-target');
    slideInRight('.slide-right-target');
    scaleIn('.scale-target');
  }, []);

  const triggerFadeIn = () => {
    fadeIn('.fade-target');
  };

  const triggerSlideInUp = () => {
    slideInUp('.slide-up-target');
  };

  const triggerSlideInDown = () => {
    slideInDown('.slide-down-target');
  };

  const triggerSlideInLeft = () => {
    slideInLeft('.slide-left-target');
  };

  const triggerSlideInRight = () => {
    slideInRight('.slide-right-target');
  };

  const triggerScaleIn = () => {
    scaleIn('.scale-target');
  };

  const triggerBounceIn = () => {
    bounceIn('.bounce-target');
  };

  const triggerShake = () => {
    shake('.shake-target');
  };

  const triggerPulse = () => {
    pulse('.pulse-target');
  };

  const triggerSpin = () => {
    if (spinnerRef.current) {
      spin(spinnerRef.current);
    }
  };

  const triggerCountUp = () => {
    if (counterRef.current) {
      countUp(counterRef.current, 1000);
    }
  };

  const triggerStaggerIn = () => {
    if (staggerRef.current) {
      staggerIn(staggerRef.current.querySelectorAll('.stagger-item'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Animation Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Animation Controls */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Animation Controls</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={triggerFadeIn} variant="primary">
                Fade In
              </Button>
              <Button onClick={triggerSlideInUp} variant="secondary">
                Slide Up
              </Button>
              <Button onClick={triggerSlideInDown} variant="outline">
                Slide Down
              </Button>
              <Button onClick={triggerSlideInLeft} variant="ghost">
                Slide Left
              </Button>
              <Button onClick={triggerSlideInRight} variant="primary">
                Slide Right
              </Button>
              <Button onClick={triggerScaleIn} variant="secondary">
                Scale In
              </Button>
              <Button onClick={triggerBounceIn} variant="outline">
                Bounce In
              </Button>
              <Button onClick={triggerShake} variant="ghost">
                Shake
              </Button>
              <Button onClick={triggerPulse} variant="primary">
                Pulse
              </Button>
              <Button onClick={triggerSpin} variant="secondary">
                Spin
              </Button>
              <Button onClick={triggerCountUp} variant="outline">
                Count Up
              </Button>
              <Button onClick={triggerStaggerIn} variant="ghost">
                Stagger In
              </Button>
            </div>
          </div>

          {/* Animation Targets */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Animation Targets</h2>
            
            {/* Fade Target */}
            <AnimatedCard className="fade-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fade In Target</h3>
              <p className="text-gray-600">This card will fade in when you click the Fade In button.</p>
            </AnimatedCard>

            {/* Slide Up Target */}
            <AnimatedCard className="slide-up-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Slide Up Target</h3>
              <p className="text-gray-600">This card will slide up from below when you click the Slide Up button.</p>
            </AnimatedCard>

            {/* Slide Down Target */}
            <AnimatedCard className="slide-down-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Slide Down Target</h3>
              <p className="text-gray-600">This card will slide down from above when you click the Slide Down button.</p>
            </AnimatedCard>

            {/* Slide Left Target */}
            <AnimatedCard className="slide-left-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Slide Left Target</h3>
              <p className="text-gray-600">This card will slide in from the left when you click the Slide Left button.</p>
            </AnimatedCard>

            {/* Slide Right Target */}
            <AnimatedCard className="slide-right-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Slide Right Target</h3>
              <p className="text-gray-600">This card will slide in from the right when you click the Slide Right button.</p>
            </AnimatedCard>

            {/* Scale Target */}
            <AnimatedCard className="scale-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scale Target</h3>
              <p className="text-gray-600">This card will scale in when you click the Scale In button.</p>
            </AnimatedCard>

            {/* Bounce Target */}
            <AnimatedCard className="bounce-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bounce Target</h3>
              <p className="text-gray-600">This card will bounce in when you click the Bounce In button.</p>
            </AnimatedCard>

            {/* Shake Target */}
            <AnimatedCard className="shake-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shake Target</h3>
              <p className="text-gray-600">This card will shake when you click the Shake button.</p>
            </AnimatedCard>

            {/* Pulse Target */}
            <AnimatedCard className="pulse-target">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pulse Target</h3>
              <p className="text-gray-600">This card will pulse when you click the Pulse button.</p>
            </AnimatedCard>

            {/* Spinner Target */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spinner Target</h3>
              <div ref={spinnerRef} className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto"></div>
            </AnimatedCard>

            {/* Counter Target */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Counter Target</h3>
              <div ref={counterRef} className="text-3xl font-bold text-blue-600 text-center">0</div>
            </AnimatedCard>

            {/* Stagger Target */}
            <div ref={staggerRef} className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stagger Target</h3>
              <div className="stagger-item bg-blue-50 p-2 rounded">Item 1</div>
              <div className="stagger-item bg-blue-50 p-2 rounded">Item 2</div>
              <div className="stagger-item bg-blue-50 p-2 rounded">Item 3</div>
              <div className="stagger-item bg-blue-50 p-2 rounded">Item 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;
