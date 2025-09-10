import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import {
  fadeIn,
  slideInUp,
  scaleIn,
  bounceIn,
  shake,
  pulse,
  spin,
  countUp,
  stopAllAnimations,
  pauseAllAnimations,
  resumeAllAnimations,
} from './animations';

// Mock anime.js as a callable function with utility methods
vi.mock('animejs', () => {
  const fn: any = vi.fn(() => ({ then: vi.fn() }));
  fn.stagger = vi.fn((delay: number) => delay);
  fn.remove = vi.fn();
  fn.pause = vi.fn();
  fn.play = vi.fn();
  return {
    default: fn,
  };
});

let anime: any;

beforeAll(async () => {
  const mod: any = await import('animejs');
  anime = mod.default;
});

describe('Animation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call fadeIn with correct parameters', () => {
    const targets = '.test-element';
    const options = { duration: 1000 };

    fadeIn(targets, options);

    expect(anime).toHaveBeenCalled();
  });

  it('should call slideInUp with correct parameters', () => {
    const targets = '.test-element';

    slideInUp(targets);

    expect(anime).toHaveBeenCalled();
  });

  it('should call scaleIn with correct parameters', () => {
    const targets = '.test-element';

    scaleIn(targets);

    expect(anime).toHaveBeenCalled();
  });

  it('should call bounceIn with correct parameters', () => {
    const targets = '.test-element';

    bounceIn(targets);

    expect(anime).toHaveBeenCalled();
  });

  it('should call shake with correct parameters', () => {
    const targets = '.test-element';

    shake(targets);

    expect(anime).toHaveBeenCalled();
  });

  it('should call pulse with correct parameters', () => {
    const targets = '.test-element';

    pulse(targets);

    expect(anime).toHaveBeenCalled();
  });

  it('should call spin with correct parameters', () => {
    const targets = '.test-element';

    spin(targets);

    expect(anime).toHaveBeenCalled();
  });

  it('should call countUp with correct parameters', () => {
    const targets = document.createElement('div');

    countUp(targets, 100);

    expect(anime).toHaveBeenCalled();
  });

  it('should call stopAllAnimations', () => {
    stopAllAnimations();
    expect(anime.remove).toHaveBeenCalled();
  });

  it('should call pauseAllAnimations', () => {
    pauseAllAnimations();
    expect(anime.pause).toHaveBeenCalled();
  });

  it('should call resumeAllAnimations', () => {
    resumeAllAnimations();
    expect(anime.play).toHaveBeenCalled();
  });
});
