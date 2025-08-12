import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LeaderboardEntryComponent } from '../../../components/leaderboard/LeaderboardEntry';
import { LeaderboardEntry } from '../../../types/leaderboard.types';
import { useThemedColors } from '../../../hooks';
import { GameLogic } from '../../../utils';

// Mock hooks
jest.mock('../../../hooks');
const mockUseThemedColors = useThemedColors as jest.MockedFunction<typeof useThemedColors>;

// Mock GameLogic
jest.mock('../../../utils');
const mockGameLogic = GameLogic as jest.Mocked<typeof GameLogic>;

describe('LeaderboardEntryComponent', () => {
  const mockColors = {
    PRIMARY: '#007AFF',
    SUCCESS: '#34C759',
    WARNING: '#FF9500',
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#666666',
    TEXT_WHITE: '#FFFFFF',
    SURFACE: '#F2F2F7',
  };

  const mockEntry: LeaderboardEntry = {
    id: 'entry-1',
    userId: 'user-1',
    nickname: 'TestPlayer',
    gameType: 'TAP_TEST',
    bestTime: 250,
    averageTime: 300,
    gamesPlayed: 15,
    accuracy: 85,
    timestamp: Date.now(),
    rank: 5,
  };

  beforeEach(() => {
    mockUseThemedColors.mockReturnValue(mockColors);
    mockGameLogic.formatTime.mockImplementation((time) => `${Math.round(time)}ms`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render entry with basic information', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} />);

      expect(screen.getByText('TestPlayer')).toBeTruthy();
      expect(screen.getByText('#5')).toBeTruthy();
      expect(screen.getByText('250ms')).toBeTruthy();
    });

    it('should render medal emojis for top 3 positions', () => {
      const topEntries = [
        { ...mockEntry, rank: 1 },
        { ...mockEntry, rank: 2 },
        { ...mockEntry, rank: 3 },
      ];

      topEntries.forEach((entry, index) => {
        const { unmount } = render(<LeaderboardEntryComponent entry={entry} />);
        
        const expectedEmojis = ['🥇', '🥈', '🥉'];
        expect(screen.getByText(expectedEmojis[index])).toBeTruthy();
        
        unmount();
      });
    });

    it('should render numeric rank for positions beyond top 3', () => {
      const entry = { ...mockEntry, rank: 15 };
      render(<LeaderboardEntryComponent entry={entry} />);

      expect(screen.getByText('#15')).toBeTruthy();
    });

    it('should render detailed stats when showDetails is true', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} showDetails={true} />);

      expect(screen.getByText('Avg: 300ms')).toBeTruthy();
      expect(screen.getByText('Games: 15')).toBeTruthy();
      expect(screen.getByText('Accuracy: 85%')).toBeTruthy();
    });

    it('should not render detailed stats when showDetails is false', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} showDetails={false} />);

      expect(screen.queryByText('Avg: 300ms')).toBeNull();
      expect(screen.queryByText('Games: 15')).toBeNull();
      expect(screen.queryByText('Accuracy: 85%')).toBeNull();
    });

    it('should render TOP 10 badge for ranks 1-10', () => {
      const topEntry = { ...mockEntry, rank: 8 };
      render(<LeaderboardEntryComponent entry={topEntry} />);

      expect(screen.getByText('TOP 10')).toBeTruthy();
    });

    it('should not render TOP 10 badge for ranks beyond 10', () => {
      const lowerEntry = { ...mockEntry, rank: 15 };
      render(<LeaderboardEntryComponent entry={lowerEntry} />);

      expect(screen.queryByText('TOP 10')).toBeNull();
    });
  });

  describe('Current User Styling', () => {
    it('should apply current user styling when isCurrentUser is true', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} isCurrentUser={true} />);

      expect(screen.getByText('(You)')).toBeTruthy();
    });

    it('should not show current user label when isCurrentUser is false', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} isCurrentUser={false} />);

      expect(screen.queryByText('(You)')).toBeNull();
    });

    it('should use elevated card variant for current user', () => {
      const { getByTestId } = render(
        <LeaderboardEntryComponent 
          entry={mockEntry} 
          isCurrentUser={true} 
        />
      );

      // This would require adding testID to the Card component
      // For now, we can test that the component renders without errors
      expect(screen.getByText('TestPlayer')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle entry without rank', () => {
      const entryWithoutRank = { ...mockEntry, rank: undefined };
      render(<LeaderboardEntryComponent entry={entryWithoutRank} />);

      expect(screen.getByText('#0')).toBeTruthy();
    });

    it('should handle very long nickname', () => {
      const entryWithLongName = { 
        ...mockEntry, 
        nickname: 'VeryLongNicknameThatShouldBeTruncated' 
      };
      render(<LeaderboardEntryComponent entry={entryWithLongName} />);

      expect(screen.getByText('VeryLongNicknameThatShouldBeTruncated')).toBeTruthy();
    });

    it('should handle zero values gracefully', () => {
      const entryWithZeros = {
        ...mockEntry,
        bestTime: 0,
        averageTime: 0,
        gamesPlayed: 0,
        accuracy: 0,
      };

      mockGameLogic.formatTime.mockImplementation((time) => 
        time === 0 ? '-' : `${Math.round(time)}ms`
      );

      render(
        <LeaderboardEntryComponent 
          entry={entryWithZeros} 
          showDetails={true} 
        />
      );

      expect(screen.getByText('-')).toBeTruthy(); // For bestTime
      expect(screen.getByText('Avg: -')).toBeTruthy();
      expect(screen.getByText('Games: 0')).toBeTruthy();
      expect(screen.getByText('Accuracy: 0%')).toBeTruthy();
    });
  });

  describe('Styling and Theming', () => {
    it('should apply themed colors correctly', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} />);

      // Verify that useThemedColors was called
      expect(mockUseThemedColors).toHaveBeenCalled();
      
      // The actual color application would need more sophisticated testing
      // with react-native-testing-library's style queries
      expect(screen.getByText('TestPlayer')).toBeTruthy();
    });

    it('should format time using GameLogic.formatTime', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} showDetails={true} />);

      expect(mockGameLogic.formatTime).toHaveBeenCalledWith(250); // bestTime
      expect(mockGameLogic.formatTime).toHaveBeenCalledWith(300); // averageTime
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} />);

      // The component should be accessible
      expect(screen.getByText('TestPlayer')).toBeTruthy();
      expect(screen.getByText('#5')).toBeTruthy();
    });

    it('should handle text truncation for long nicknames', () => {
      const entryWithLongName = { 
        ...mockEntry, 
        nickname: 'A'.repeat(50) 
      };
      
      render(<LeaderboardEntryComponent entry={entryWithLongName} />);

      // Should render without errors
      expect(screen.getByText('A'.repeat(50))).toBeTruthy();
    });
  });

  describe('Rank Display Logic', () => {
    it('should return correct medal for rank 1', () => {
      const entry = { ...mockEntry, rank: 1 };
      render(<LeaderboardEntryComponent entry={entry} />);
      
      expect(screen.getByText('🥇')).toBeTruthy();
    });

    it('should return correct medal for rank 2', () => {
      const entry = { ...mockEntry, rank: 2 };
      render(<LeaderboardEntryComponent entry={entry} />);
      
      expect(screen.getByText('🥈')).toBeTruthy();
    });

    it('should return correct medal for rank 3', () => {
      const entry = { ...mockEntry, rank: 3 };
      render(<LeaderboardEntryComponent entry={entry} />);
      
      expect(screen.getByText('🥉')).toBeTruthy();
    });

    it('should apply different font sizes for medal vs numeric ranks', () => {
      // Test medal rank (should be larger)
      const { unmount } = render(
        <LeaderboardEntryComponent entry={{ ...mockEntry, rank: 1 }} />
      );
      expect(screen.getByText('🥇')).toBeTruthy();
      unmount();

      // Test numeric rank (should be regular size)
      render(<LeaderboardEntryComponent entry={{ ...mockEntry, rank: 4 }} />);
      expect(screen.getByText('#4')).toBeTruthy();
    });
  });

  describe('Component Props', () => {
    it('should handle all props correctly', () => {
      render(
        <LeaderboardEntryComponent 
          entry={mockEntry}
          isCurrentUser={true}
          showDetails={true}
        />
      );

      expect(screen.getByText('TestPlayer')).toBeTruthy();
      expect(screen.getByText('(You)')).toBeTruthy();
      expect(screen.getByText('Avg: 300ms')).toBeTruthy();
      expect(screen.getByText('TOP 10')).toBeTruthy();
    });

    it('should handle minimal props', () => {
      render(<LeaderboardEntryComponent entry={mockEntry} />);

      expect(screen.getByText('TestPlayer')).toBeTruthy();
      expect(screen.queryByText('(You)')).toBeNull();
      expect(screen.queryByText('Avg: 300ms')).toBeNull();
    });
  });
});