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
import { COLORS, SPACING, TYPOGRAPHY, GAME_COLORS, BORDER_RADIUS } from '../../constants';
import { OnboardingStackParamList } from '../../types';

const { width } = Dimensions.get('window');

type TutorialScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Tutorial'>;
};

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const colorAnim = new Animated.Value(0);

  const steps = [
    {
      title: '🎯 게임 방법',
      description: '화면이 빨간색에서 초록색으로\n바뀌는 순간을 기다리세요',
      demo: 'waiting',
    },
    {
      title: '⚡ 빠른 반응',
      description: '초록색으로 바뀌면\n즉시 화면을 탭하세요!',
      demo: 'ready',
    },
    {
      title: '📊 결과 측정',
      description: '5번의 시도 후\n평균 반응시간을 확인하세요',
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
        outputRange: [GAME_COLORS.WAITING, GAME_COLORS.READY],
      });
    } else if (step.demo === 'ready') {
      return GAME_COLORS.READY;
    }
    return COLORS.PRIMARY;
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
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {/* Demo visualization */}
        <View style={styles.demoContainer}>
          {currentStepData.demo !== 'result' ? (
            <Animated.View
              style={[
                styles.demoButton,
                { backgroundColor: getDemoColor() },
              ]}
            >
              <Text style={styles.demoText}>
                {currentStepData.demo === 'waiting' ? '대기 중...' : '지금 탭!'}
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.resultDemo}>
              <Text style={styles.resultTitle}>결과 예시</Text>
              <Text style={styles.resultValue}>평균: 245ms</Text>
              <Text style={styles.resultSubtext}>훌륭한 반응속도!</Text>
            </View>
          )}
        </View>
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="건너뛰기"
          onPress={handleSkip}
          variant="ghost"
          style={styles.skipButton}
        />
        <Button
          title={currentStep === steps.length - 1 ? '시작하기' : '다음'}
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
    backgroundColor: COLORS.BACKGROUND,
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
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  
  progressDotActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  
  description: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    color: COLORS.TEXT_SECONDARY,
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
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  
  resultDemo: {
    alignItems: 'center',
    padding: SPACING.XL,
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.XL,
    minWidth: 200,
  },
  
  resultTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  
  resultValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    color: COLORS.SUCCESS,
    marginBottom: SPACING.XS,
  },
  
  resultSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
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