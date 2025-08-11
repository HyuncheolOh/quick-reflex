import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../../components/common/Card';

// Mock useThemedColors hook
jest.mock('../../hooks', () => ({
  useThemedColors: () => ({
    CARD: '#FFFFFF',
    TEXT_TERTIARY: '#8E8E93',
  }),
}));

describe('Card', () => {
  const TestContent = () => <Text>Card Content</Text>;

  describe('Basic Rendering', () => {
    it('should render children content', () => {
      const { getByText } = render(
        <Card>
          <TestContent />
        </Card>
      );
      
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('should render as View by default', () => {
      const { getByTestId } = render(
        <Card testID="card">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.type).toBe('View');
    });

    it('should render as TouchableOpacity when touchable is true', () => {
      const { getByTestId } = render(
        <Card testID="card" touchable>
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.type).toBe('TouchableOpacity');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { getByTestId } = render(
        <Card testID="card">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF',
          }),
        ])
      );
    });

    it('should render elevated variant with shadow', () => {
      const { getByTestId } = render(
        <Card testID="card" variant="elevated">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
          }),
        ])
      );
    });

    it('should render outlined variant', () => {
      const { getByTestId } = render(
        <Card testID="card" variant="outlined">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#8E8E93',
          }),
        ])
      );
    });
  });

  describe('Padding', () => {
    it('should apply medium padding by default', () => {
      const { getByTestId } = render(
        <Card testID="card">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 16, // MD spacing
          }),
        ])
      );
    });

    it('should apply small padding', () => {
      const { getByTestId } = render(
        <Card testID="card" padding="SM">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 8, // SM spacing
          }),
        ])
      );
    });

    it('should apply large padding', () => {
      const { getByTestId } = render(
        <Card testID="card" padding="LG">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 24, // LG spacing
          }),
        ])
      );
    });

    it('should apply extra large padding', () => {
      const { getByTestId } = render(
        <Card testID="card" padding="XL">
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 32, // XL spacing
          }),
        ])
      );
    });
  });

  describe('Touchable Behavior', () => {
    it('should call onPress when touchable card is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Card testID="card" touchable onPress={mockOnPress}>
          <TestContent />
        </Card>
      );
      
      fireEvent.press(getByTestId('card'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not be pressable when touchable is false', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Card testID="card" touchable={false} onPress={mockOnPress}>
          <TestContent />
        </Card>
      );
      
      // Should not be able to press a non-touchable card
      const card = getByTestId('card');
      expect(card.type).toBe('View');
    });

    it('should pass through TouchableOpacity props', () => {
      const mockOnPress = jest.fn();
      const mockOnLongPress = jest.fn();
      
      const { getByTestId } = render(
        <Card 
          testID="card" 
          touchable 
          onPress={mockOnPress}
          onLongPress={mockOnLongPress}
          activeOpacity={0.5}
        >
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.onPress).toBe(mockOnPress);
      expect(card.props.onLongPress).toBe(mockOnLongPress);
      expect(card.props.activeOpacity).toBe(0.5);
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom styles', () => {
      const customStyle = {
        marginTop: 20,
        borderRadius: 8,
      };
      
      const { getByTestId } = render(
        <Card testID="card" style={customStyle}>
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([customStyle])
      );
    });

    it('should merge custom styles with base styles', () => {
      const customStyle = { backgroundColor: 'red' };
      
      const { getByTestId } = render(
        <Card testID="card" style={customStyle}>
          <TestContent />
        </Card>
      );
      
      const card = getByTestId('card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderRadius: 12, // Base border radius
          }),
          customStyle,
        ])
      );
    });
  });


  describe('Content Rendering', () => {
    it('should render multiple children', () => {
      const { getByText } = render(
        <Card>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </Card>
      );
      
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should render complex nested content', () => {
      const { getByText, getByTestId } = render(
        <Card>
          <TestContent />
          <Card testID="nested-card" variant="outlined">
            <Text>Nested Content</Text>
          </Card>
        </Card>
      );
      
      expect(getByText('Card Content')).toBeTruthy();
      expect(getByText('Nested Content')).toBeTruthy();
      expect(getByTestId('nested-card')).toBeTruthy();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for default card', () => {
      const { toJSON } = render(
        <Card>
          <TestContent />
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for touchable card', () => {
      const { toJSON } = render(
        <Card touchable>
          <TestContent />
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for elevated card', () => {
      const { toJSON } = render(
        <Card variant="elevated">
          <TestContent />
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for outlined card', () => {
      const { toJSON } = render(
        <Card variant="outlined">
          <TestContent />
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});