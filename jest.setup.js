// @testing-library/react-native의 최신 버전에서는 extend-expect가 자동으로 포함됩니다

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {},
    manifest: {},
  },
}));

// Mock React Native modules that cause issues
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: jest.fn(() => ({ setValue: jest.fn() })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
  },
}));

// Mock expo modules
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Date.now for timing tests
const originalDateNow = Date.now;

export const mockDateNow = (mockTime: number) => {
  Date.now = jest.fn(() => mockTime);
};

export const restoreDateNow = () => {
  Date.now = originalDateNow;
};

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});