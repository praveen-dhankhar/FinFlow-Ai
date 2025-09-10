import React, { useRef, useEffect } from 'react';
import { fadeIn, slideInUp, scaleIn, cardHoverIn, cardHoverOut } from '../utils/animations';
import { cn } from '../utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideInUp' | 'scaleIn';
  delay?: number;
  hover?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  animation = 'fadeIn',
  delay = 0,
  hover = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const animations = {
      fadeIn: () => fadeIn(cardRef.current!, { delay }),
      slideInUp: () => slideInUp(cardRef.current!, { delay }),
      scaleIn: () => scaleIn(cardRef.current!, { delay }),
    };

    animations[animation]();
  }, [animation, delay]);

  const handleMouseEnter = () => {
    if (hover && cardRef.current) {
      cardHoverIn(cardRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (hover && cardRef.current) {
      cardHoverOut(cardRef.current);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-300',
        hover && 'cursor-pointer',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
