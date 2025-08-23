import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  className = '',
  formatter
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * value);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  const formattedValue = formatter ? formatter(displayValue) : displayValue.toLocaleString();

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

// Currency formatter
export function AnimatedCurrency({
  value,
  currency = 'GBP',
  ...props
}: Omit<AnimatedCounterProps, 'formatter'> & { currency?: string }) {
  return (
    <AnimatedCounter
      {...props}
      value={value}
      formatter={(val) => 
        new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency,
        }).format(val / 100) // Convert from pence to pounds
      }
    />
  );
}

// Percentage formatter
export function AnimatedPercentage({
  value,
  decimals = 1,
  ...props
}: Omit<AnimatedCounterProps, 'formatter' | 'suffix'> & { decimals?: number }) {
  return (
    <AnimatedCounter
      {...props}
      value={value}
      suffix="%"
      formatter={(val) => val.toFixed(decimals)}
    />
  );
}