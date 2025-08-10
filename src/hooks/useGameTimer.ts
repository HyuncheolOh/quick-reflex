import { useState, useEffect, useRef } from 'react';

interface UseGameTimerProps {
  duration?: number;
  interval?: number;
  autoStart?: boolean;
  onTick?: (timeLeft: number) => void;
  onComplete?: () => void;
}

export const useGameTimer = ({
  duration = 1000,
  interval = 100,
  autoStart = false,
  onTick,
  onComplete,
}: UseGameTimerProps = {}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isCompleted) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current!;
        const remaining = Math.max(0, duration - elapsed);
        
        setTimeLeft(remaining);
        onTick?.(remaining);
        
        if (remaining <= 0) {
          setIsActive(false);
          setIsCompleted(true);
          onComplete?.();
        }
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, duration, interval, onTick, onComplete, isCompleted]);

  const start = () => {
    if (!isCompleted) {
      startTimeRef.current = Date.now();
      setIsActive(true);
    }
  };

  const pause = () => {
    setIsActive(false);
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(duration);
    setIsCompleted(false);
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restart = () => {
    reset();
    start();
  };

  return {
    timeLeft,
    isActive,
    isCompleted,
    start,
    pause,
    reset,
    restart,
  };
};