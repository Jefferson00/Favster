const easing = [0.6, -0.05, 0.01, 0.99];

export const fadeInUp = {
  initial: {
    y: 60,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
}

export const stagger = {
  initial: {
    y: 60,
    opacity: 0,
    transition: { duration: 0.6, ease: easing }
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing,
      staggerChildren: 0.1
    }
  },
};

export const staggerDelay = {
  initial: {
    y: 60,
    opacity: 0,
    transition: { duration: 0.6, ease: easing }
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 1,
      duration: 0.6,
      ease: easing,
      staggerChildren: 0.5
    }
  },
};

export const fadeIn = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
}

export const staggerFadeIn = {
  initial: {
    opacity: 0,
    transition: { duration: 0.6, ease: easing }
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing,
      staggerChildren: 0.2
    }
  },
};