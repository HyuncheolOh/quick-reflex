import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { TYPOGRAPHY, SPACING } from "../../constants";
import { useThemedColors } from "../../hooks";
import { useLocalization } from "../../contexts";

interface CountdownTimerProps {
  duration: number; // in milliseconds
  onComplete: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  onComplete,
  onTick,
  autoStart = true,
}) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [timeLeft, setTimeLeft] = useState(Math.ceil(duration / 1000));
  const [isActive, setIsActive] = useState(autoStart);
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          onTick?.(newTime);

          // Animate scale
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();

          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, onComplete, onTick, scaleValue]);

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);
  const reset = () => {
    setTimeLeft(Math.ceil(duration / 1000));
    setIsActive(autoStart);
  };

  // Expose control methods through ref if needed
  React.useImperativeHandle(React.createRef<any>(), () => ({
    start,
    stop,
    reset,
  }));

  if (timeLeft <= 0) {
    return (
      <View style={styles.container}>
        <Animated.Text
          style={[
            styles.goText, 
            { transform: [{ scale: scaleValue }], color: colors.SUCCESS }
          ]}
        >
{t.game.tapNow}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { flex: 1, justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Animated.Text
        style={[
          styles.countdownText,
          { transform: [{ scale: scaleValue }], color: timeLeft <= 1 ? colors.ERROR : colors.TEXT_PRIMARY },
        ]}
      >
        {timeLeft}
      </Animated.Text>
      <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>{t.game.getReady}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.XL,
  },

  countdownText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.GIANT * 2.5,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.EXTRABOLD,
    textAlign: "center",
    letterSpacing: 2,
  },

  goText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.GIANT * 1.5,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.EXTRABOLD,
    textAlign: "center",
    letterSpacing: 1.5,
  },

  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
    marginTop: SPACING.MD,
    textAlign: "center",
  },
});
