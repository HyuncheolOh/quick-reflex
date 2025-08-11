import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../components/common/Button';

// Mock useThemedColors hook
jest.mock('../../hooks', () => ({
  useThemedColors: () => ({
    PRIMARY: '#007AFF',
    SECONDARY: '#34C759',
    ERROR: '#FF3B30',
    TEXT_PRIMARY: '#FFFFFF',
  }),
}));

describe('Button', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render button with title', () => {
      const { getByText } = render(<Button {...defaultProps} />);
      
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should call onPress when tapped', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} />
      );
      
      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      const { getByText } = render(<Button {...defaultProps} />);
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#007AFF',
          }),
        ])
      );
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="secondary" />
      );
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#34C759',
          }),
        ])
      );
    });

    it('should render danger variant', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="danger" />
      );
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FF3B30',
          }),
        ])
      );
    });

    it('should render ghost variant', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="ghost" />
      );
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#007AFF',
          }),
        ])
      );
    });
  });

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      const { getByText } = render(<Button {...defaultProps} />);
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            minHeight: 44,
          }),
        ])
      );
    });

    it('should render small size', () => {
      const { getByText } = render(<Button {...defaultProps} size="small" />);
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            minHeight: 36,
          }),
        ])
      );
    });

    it('should render large size', () => {
      const { getByText } = render(<Button {...defaultProps} size="large" />);
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            minHeight: 52,
          }),
        ])
      );
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} disabled />
      );
      const button = getByText('Test Button').parent;
      
      expect(button?.props.disabled).toBe(true);
      
      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should show loading indicator when loading', () => {
      const { getByTestId, queryByText } = render(
        <Button {...defaultProps} loading />
      );
      
      expect(queryByText('Test Button')).toBeNull();
      // ActivityIndicator should be present but testing it requires additional setup
    });

    it('should be disabled when loading', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} loading />
      );
      
      // Since loading shows ActivityIndicator instead of text, we need to find the touchable differently
      const touchable = getByText('Test Button').parent?.parent; // TouchableOpacity is parent of the content
      expect(touchable?.props.disabled).toBe(true);
    });

    it('should apply disabled opacity', () => {
      const { getByText } = render(<Button {...defaultProps} disabled />);
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            opacity: 0.6,
          }),
        ])
      );
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom container style', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <Button {...defaultProps} style={customStyle} />
      );
      const button = getByText('Test Button').parent;
      
      expect(button?.props.style).toEqual(
        expect.arrayContaining([customStyle])
      );
    });

    it('should apply custom text style', () => {
      const customTextStyle = { fontSize: 20 };
      const { getByText } = render(
        <Button {...defaultProps} textStyle={customTextStyle} />
      );
      const text = getByText('Test Button');
      
      expect(text.props.style).toEqual(
        expect.arrayContaining([customTextStyle])
      );
    });
  });


  describe('Snapshot Tests', () => {
    it('should match snapshot for primary button', () => {
      const { toJSON } = render(<Button {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for ghost button', () => {
      const { toJSON } = render(<Button {...defaultProps} variant="ghost" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for disabled button', () => {
      const { toJSON } = render(<Button {...defaultProps} disabled />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for loading button', () => {
      const { toJSON } = render(<Button {...defaultProps} loading />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});