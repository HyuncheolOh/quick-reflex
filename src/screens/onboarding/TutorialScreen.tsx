import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../../components/common';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { OnboardingStackParamList } from '../../types';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

const { width } = Dimensions.get('window');

type TutorialScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Tutorial'>;
};

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);
  const colorAnim = new Animated.Value(0);

  const steps = [
    {
      title: t.tutorial.steps[1].title,
      description: t.tutorial.steps[1].description,
      demo: 'waiting',
    },
    {
      title: t.tutorial.steps[2].title,
      description: t.tutorial.steps[2].description,
      demo: 'ready',
    },
    {
      title: t.tutorial.steps[3].title,
      description: t.tutorial.steps[3].description,
      demo: 'result',
    },
  ];

  React.useEffect(() => {
    // Animate color demo
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [colorAnim]);

  const getDemoColor = () => {
    const step = steps[currentStep];
    if (step.demo === 'waiting') {
      return colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.ERROR, colors.SUCCESS], // 빨강에서 초록으로 (대기→준비)
      });
    } else if (step.demo === 'ready') {
      return colors.SUCCESS; // 준비 상태는 초록색
    }
    return colors.PRIMARY;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate('FirstGame');
    }
  };

  const handleSkip = () => {
    navigation.navigate('FirstGame');
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              { backgroundColor: index <= currentStep ? colors.PRIMARY : colors.TEXT_TERTIARY },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>{currentStepData.title}</Text>
        <Text style={[styles.description, { color: colors.TEXT_SECONDARY }]}>{currentStepData.description}</Text>

        {/* Demo visualization */}
        <View style={styles.demoContainer}>
          {currentStepData.demo !== 'result' ? (
            <Animated.View
              style={[
                styles.demoButton,
                { backgroundColor: getDemoColor() },
              ]}
            >
              <Text style={[styles.demoText, { color: colors.TEXT_WHITE }]}>
                {currentStepData.demo === 'waiting' ? t.tutorial.demo.waiting : t.tutorial.demo.tapNow}
              </Text>
            </Animated.View>
          ) : (
            <View style={[styles.resultDemo, { backgroundColor: colors.SURFACE }]}>
              <Text style={[styles.resultTitle, { color: colors.TEXT_SECONDARY }]}>{t.tutorial.demo.resultExample}</Text>
              <Text style={[styles.resultValue, { color: colors.SUCCESS }]}>{t.tutorial.demo.averageTime}</Text>
              <Text style={[styles.resultSubtext, { color: colors.TEXT_SECONDARY }]}>{t.tutorial.demo.excellentResponse}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={t.tutorial.skip}
          onPress={handleSkip}
          variant="ghost"
          style={styles.skipButton}
        />
        <Button
          title={currentStep === steps.length - 1 ? t.tutorial.start : t.common.next}
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XXL,
  },
  
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.XXL,
  },
  
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.XXL,
  },
  
  demoContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  
  demoButton: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS.XL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  demoText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    textAlign: 'center',
  },
  
  resultDemo: {
    alignItems: 'center',
    padding: SPACING.XL,
    borderRadius: BORDER_RADIUS.XL,
    minWidth: 200,
  },
  
  resultTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    marginBottom: SPACING.SM,
  },
  
  resultValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    marginBottom: SPACING.XS,
  },
  
  resultSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  
  skipButton: {
    flex: 1,
  },
  
  nextButton: {
    flex: 2,
  },
});