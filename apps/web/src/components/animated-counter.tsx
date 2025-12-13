
'use client';

import { useState, useEffect, useRef } from 'react';

type AnimatedCounterProps = {
  to: number;
  duration?: number;
};

export default function AnimatedCounter({ to, duration = 1.5 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const end = to;
          if (start === end) return;

          const totalFrames = Math.round(duration * 60);
          const increment = end / totalFrames;
          let currentFrame = 0;
          
          const counter = setInterval(() => {
            start += increment;
            currentFrame++;
            setCount(Math.min(Math.ceil(start), end));

            if (currentFrame === totalFrames) {
              clearInterval(counter);
            }
          }, 1000 / 60);

          return () => clearInterval(counter);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [to, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}
