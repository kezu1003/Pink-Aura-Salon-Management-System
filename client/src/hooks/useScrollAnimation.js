import { useState, useEffect } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('scroll-trigger');
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        const isInView = elementTop < windowHeight * (1 - threshold) && elementBottom > windowHeight * threshold;
        setIsVisible(isInView);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isVisible;
};

export const useScrollAnimationMultiple = (threshold = 0.1) => {
  const [visibleElements, setVisibleElements] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-scroll-animation]');
      const newVisibleElements = new Set();

      elements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        const isInView = elementTop < windowHeight * (1 - threshold) && elementBottom > windowHeight * threshold;
        
        if (isInView) {
          newVisibleElements.add(index);
        }
      });

      setVisibleElements(newVisibleElements);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return visibleElements;
};

