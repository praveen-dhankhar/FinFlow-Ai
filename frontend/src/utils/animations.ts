import * as Anime from 'animejs';
const anime: any = (Anime as any)?.default ?? (Anime as any);

// Auth helpers
export const focusField = (el: Element) => {
  return anime({ targets: el, scale: [1, 1.02, 1], duration: 200, easing: 'easeOutQuad' });
};
export const showError = (el: Element) => {
  return anime({ targets: el, translateY: [-6, 0], opacity: [0, 1], duration: 250, easing: 'easeOutBack' });
};
export const showSuccess = (el: Element) => {
  return anime({ targets: el, translateY: [10, 0], opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });
};

// Fade animations
export const fadeIn = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
    ...options,
  });
};

export const fadeOut = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    opacity: [1, 0],
    duration: 400,
    easing: 'easeInQuad',
    ...options,
  });
};

// Slide animations
export const slideInUp = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
    ...options,
  });
};

export const slideInDown = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
    ...options,
  });
};

export const slideInLeft = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    translateX: [-50, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
    ...options,
  });
};

export const slideInRight = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    translateX: [50, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
    ...options,
  });
};

// Scale animations
export const scaleIn = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutBack',
    ...options,
  });
};

export const scaleOut = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    scale: [1, 0.8],
    opacity: [1, 0],
    duration: 300,
    easing: 'easeInBack',
    ...options,
  });
};

// Rotation animations
export const rotateIn = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    rotate: [-180, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutBack',
    ...options,
  });
};

// Stagger animations
export const staggerIn = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 600,
    delay: anime.stagger ? anime.stagger(100) : 0,
    easing: 'easeOutQuad',
    ...options,
  });
};

// Bounce animations
export const bounceIn = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    scale: [0.3, 1.1, 1],
    opacity: [0, 1, 1],
    duration: 800,
    easing: 'easeOutElastic(1, .8)',
    ...options,
  });
};

// Shake animation
export const shake = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    translateX: [0, -10, 10, -10, 10, 0],
    duration: 500,
    easing: 'easeInOutQuad',
    ...options,
  });
};

// Pulse animation
export const pulse = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    scale: [1, 1.05, 1],
    duration: 1000,
    easing: 'easeInOutQuad',
    loop: true,
    ...options,
  });
};

// Loading spinner animation
export const spin = (targets: string | Element | NodeList, options?: any) => {
  return anime({
    targets,
    rotate: 360,
    duration: 1000,
    easing: 'linear',
    loop: true,
    ...options,
  });
};

// Progress bar animation
export const progressBar = (targets: string | Element | NodeList, progress: number, options?: any) => {
  return anime({
    targets,
    width: `${progress}%`,
    duration: 1000,
    easing: 'easeOutQuad',
    ...options,
  });
};

// Counter animation
export const countUp = (targets: string | Element | NodeList, endValue: number, options?: any) => {
  return anime({
    targets,
    innerHTML: [0, endValue],
    duration: 2000,
    easing: 'easeOutQuad',
    round: 1,
    update: function(anim: any) {
      if (targets instanceof Element) {
        (targets as Element).innerHTML = Math.floor((anim as any).animatables[0].target.innerHTML).toString();
      }
    },
    ...options,
  });
};

// Timeline utilities
export const createTimeline = (options?: any) => {
  return anime.timeline ? anime.timeline(options) : anime(options);
};

// Page transition animations
export const pageTransitionIn = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
  });
};

export const pageTransitionOut = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    translateY: [0, -30],
    opacity: [1, 0],
    duration: 400,
    easing: 'easeInQuad',
  });
};

// Card hover animations
export const cardHoverIn = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    scale: [1, 1.02],
    boxShadow: [
      '0 2px 15px -3px rgba(0, 0, 0, 0.07)',
      '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    ],
    duration: 300,
    easing: 'easeOutQuad',
  });
};

export const cardHoverOut = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    scale: [1.02, 1],
    boxShadow: [
      '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      '0 2px 15px -3px rgba(0, 0, 0, 0.07)'
    ],
    duration: 300,
    easing: 'easeOutQuad',
  });
};

// Notification animations
export const notificationIn = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    translateX: [300, 0],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutBack',
  });
};

export const notificationOut = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    translateX: [0, 300],
    opacity: [1, 0],
    duration: 300,
    easing: 'easeInBack',
  });
};

// Modal animations
export const modalIn = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 300,
    easing: 'easeOutBack',
  });
};

export const modalOut = (targets: string | Element | NodeList) => {
  return anime({
    targets,
    scale: [1, 0.8],
    opacity: [1, 0],
    duration: 200,
    easing: 'easeInBack',
  });
};

// Utility function to stop all animations
export const stopAllAnimations = () => {
  anime.remove ? anime.remove() : null;
};

// Utility function to pause all animations
export const pauseAllAnimations = () => {
  anime.pause ? anime.pause() : null;
};

// Utility function to resume all animations
export const resumeAllAnimations = () => {
  anime.play ? anime.play() : null;
};
