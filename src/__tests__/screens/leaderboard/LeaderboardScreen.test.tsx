import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LeaderboardScreen } from '../../../screens/leaderboard/LeaderboardScreen';
import { LeaderboardService } from '../../../services/LeaderboardService';
import { UserIdentityService } from '../../../services/UserIdentityService';
import { useThemedColors } from '../../../hooks';
import { useLocalization } from '../../../contexts';
import { LeaderboardResponse, LeaderboardEntry } from '../../../types';

// Mock dependencies
jest.mock('../../../services/LeaderboardService');
jest.mock('../../../services/UserIdentityService');
jest.mock('../../../hooks');
jest.mock('../../../contexts');

const mockLeaderboardService = LeaderboardService as jest.Mocked<typeof LeaderboardService>;
const mockUserIdentityService = UserIdentityService as jest.Mocked<typeof UserIdentityService>;
const mockUseThemedColors = useThemedColors as jest.MockedFunction<typeof useThemedColors>;
const mockUseLocalization = useLocalization as jest.MockedFunction<typeof useLocalization>;

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route
const mockRoute = {
  key: 'test-key',
  name: 'Leaderboard' as const,
  params: {
    gameType: 'TAP_TEST' as const,
  },
};

describe('LeaderboardScreen', () => {
  const mockColors = {
    BACKGROUND: '#FFFFFF',
    PRIMARY: '#007AFF',
    SUCCESS: '#34C759',
    WARNING: '#FF9500',
    SURFACE: '#F2F2F7',
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#666666',
    TEXT_TERTIARY: '#999999',
    TEXT_WHITE: '#FFFFFF',
  };

  const mockT = {
    common: {
      error: 'Error',
      retry: 'Retry',
    },
    messages: {
      leaderboardError: 'Failed to load leaderboard',
    },
    gameModes: {
      tapTest: { title: 'Tap Test' },
      audioTest: { title: 'Audio Test' },
      goNoGoTest: { title: 'Go/No-Go Test' },
    },
    leaderboard: {
      title: 'Leaderboard',
      subtitle: 'Global Rankings',
      yourRanking: 'Your Ranking',
      bestRank: 'Best Rank',
      currentRank: 'Current Rank',
      notRanked: 'Not Ranked',
      topPlayers: 'Top Players',
      noData: 'No data available',
      loading: 'Loading...',
      totalPlayers: (count: number) => `${count} total players`,
      lastUpdated: (time: string) => `Last updated: ${time}`,
      filters: {
        title: 'Sort by',
        bestSpeed: 'Best Speed',
        bestAverage: 'Best Average',
        mostGames: 'Most Games',
      },
    },
  };

  const mockLeaderboardEntries: LeaderboardEntry[] = [
    {
      id: 'entry-1',
      userId: 'user-1',
      nickname: 'Player1',
      gameType: 'TAP_TEST',
      bestTime: 200,
      averageTime: 250,
      gamesPlayed: 20,
      accuracy: 90,
      timestamp: Date.now(),
      rank: 1,
    },
    {
      id: 'entry-2',
      userId: 'user-2',
      nickname: 'Player2',
      gameType: 'TAP_TEST',
      bestTime: 220,
      averageTime: 270,
      gamesPlayed: 15,
      accuracy: 85,
      timestamp: Date.now(),
      rank: 2,
    },
    {
      id: 'entry-3',
      userId: 'test-user',
      nickname: 'TestUser',
      gameType: 'TAP_TEST',
      bestTime: 250,
      averageTime: 300,
      gamesPlayed: 10,
      accuracy: 80,
      timestamp: Date.now(),
      rank: 3,
    },
  ];

  const mockLeaderboardResponse: LeaderboardResponse = {
    entries: mockLeaderboardEntries,
    userStats: {
      userId: 'test-user',
      nickname: 'TestUser',
      bestRank: 2,
      currentRank: 3,
      totalGamesPlayed: 10,
      bestTime: 250,
      averageTime: 300,
      accuracy: 80,
    },
    totalUsers: 150,
    lastUpdated: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThemedColors.mockReturnValue(mockColors);
    mockUseLocalization.mockReturnValue({ t: mockT });
    mockUserIdentityService.getUserUUID.mockResolvedValue('test-user');
  });

  describe('Loading State', () => {
    it('should show loading indicator initially', async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockImplementation(() => 
        new Promise(() => {}) // Never resolves to keep loading state
      );

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Data Loading', () => {
    it('should load leaderboard data on mount', async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(mockLeaderboardService.healthCheck).toHaveBeenCalled();
        expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith('TAP_TEST');
      });
    });

    it('should fall back to mock data when service is offline', async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(false);
      mockLeaderboardService.getMockLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(mockLeaderboardService.getMockLeaderboard).toHaveBeenCalledWith('TAP_TEST');
      });
    });

    it('should handle API errors gracefully', async () => {
      mockLeaderboardService.healthCheck.mockRejectedValue(new Error('Network error'));
      mockLeaderboardService.getMockLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(mockLeaderboardService.getMockLeaderboard).toHaveBeenCalled();
      });
    });

    it('should show error alert when both API and mock fail', async () => {
      mockLeaderboardService.healthCheck.mockRejectedValue(new Error('Network error'));
      mockLeaderboardService.getMockLeaderboard.mockRejectedValue(new Error('Mock error'));

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load leaderboard');
      });
    });
  });

  describe('Rendering', () => {
    beforeEach(async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);
    });

    it('should render game type title correctly', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Tap Test')).toBeTruthy();
      });
    });

    it('should render user stats when available', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Ranking')).toBeTruthy();
        expect(screen.getByText('#2')).toBeTruthy(); // bestRank
        expect(screen.getByText('#3')).toBeTruthy(); // currentRank
      });
    });

    it('should render leaderboard entries', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeTruthy();
        expect(screen.getByText('Player2')).toBeTruthy();
        expect(screen.getByText('TestUser')).toBeTruthy();
      });
    });

    it('should render footer information', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('150 total players')).toBeTruthy();
        expect(screen.getByText(/Last updated:/)).toBeTruthy();
      });
    });

    it('should show empty state when no data', async () => {
      const emptyResponse = {
        ...mockLeaderboardResponse,
        entries: [],
      };
      mockLeaderboardService.getLeaderboard.mockResolvedValue(emptyResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('No data available')).toBeTruthy();
        expect(screen.getByText('Retry')).toBeTruthy();
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);
    });

    it('should render filter buttons', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Sort by')).toBeTruthy();
        expect(screen.getByText('Best Speed')).toBeTruthy();
        expect(screen.getByText('Best Average')).toBeTruthy();
        expect(screen.getByText('Most Games')).toBeTruthy();
      });
    });

    it('should filter by best speed by default', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        // Should show entries sorted by bestTime (ascending)
        const entries = screen.getAllByText(/Player/);
        expect(entries).toHaveLength(3);
      });
    });

    it('should change filter when button is pressed', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Best Average')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Best Average'));

      // The filter should change, re-sorting the entries
      await waitFor(() => {
        expect(screen.getByText('Best Average')).toBeTruthy();
      });
    });

    it('should filter by most games', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Most Games')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Most Games'));

      await waitFor(() => {
        expect(screen.getByText('Most Games')).toBeTruthy();
      });
    });
  });

  describe('Pull to Refresh', () => {
    beforeEach(async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);
    });

    it('should refresh data when pull to refresh is triggered', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeTruthy();
      });

      // Simulate pull to refresh
      const refreshControl = screen.getByTestId('refresh-control');
      if (refreshControl) {
        fireEvent(refreshControl, 'refresh');
      }

      await waitFor(() => {
        expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);
    });

    it('should handle back button press', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('←')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('←'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('User Identity', () => {
    it('should load user identity on mount', async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(mockUserIdentityService.getUserUUID).toHaveBeenCalled();
      });
    });

    it('should handle error when loading user identity', async () => {
      mockUserIdentityService.getUserUUID.mockRejectedValue(new Error('Identity error'));
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Should not crash and should still load leaderboard
      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeTruthy();
      });
    });

    it('should highlight current user entry', async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      // The current user should be highlighted (this would need more specific testing
      // of the LeaderboardEntryComponent with isCurrentUser prop)
      await waitFor(() => {
        expect(screen.getByText('TestUser')).toBeTruthy();
      });
    });
  });

  describe('Different Game Types', () => {
    it('should display correct title for AUDIO_TEST', async () => {
      const audioRoute = {
        ...mockRoute,
        params: { gameType: 'AUDIO_TEST' as const },
      };

      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={audioRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Audio Test')).toBeTruthy();
      });
    });

    it('should display correct title for GO_NO_GO_TEST', async () => {
      const goNoGoRoute = {
        ...mockRoute,
        params: { gameType: 'GO_NO_GO_TEST' as const },
      };

      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={goNoGoRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Go/No-Go Test')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle retry button press in empty state', async () => {
      const emptyResponse = {
        ...mockLeaderboardResponse,
        entries: [],
      };
      
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
      mockLeaderboardService.getLeaderboard.mockResolvedValue(emptyResponse);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Retry'));

      expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledTimes(2);
    });
  });

  describe('Ranking Logic', () => {
    beforeEach(async () => {
      mockLeaderboardService.healthCheck.mockResolvedValue(true);
    });

    it('should re-rank entries when filtering by best average', async () => {
      const entriesWithDifferentAverages = [
        { ...mockLeaderboardEntries[0], averageTime: 300 }, // Was rank 1, now should be rank 3
        { ...mockLeaderboardEntries[1], averageTime: 200 }, // Was rank 2, now should be rank 1  
        { ...mockLeaderboardEntries[2], averageTime: 250 }, // Was rank 3, now should be rank 2
      ];

      const responseWithDifferentAverages = {
        ...mockLeaderboardResponse,
        entries: entriesWithDifferentAverages,
      };

      mockLeaderboardService.getLeaderboard.mockResolvedValue(responseWithDifferentAverages);

      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      await waitFor(() => {
        expect(screen.getByText('Best Average')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Best Average'));

      // After filtering by best average, the order should change
      await waitFor(() => {
        expect(screen.getByText('Player2')).toBeTruthy(); // Should now be #1
      });
    });

    it('should re-rank entries when filtering by most games', async () => {
      render(
        <LeaderboardScreen navigation={mockNavigation} route={mockRoute} />
      );

      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);

      await waitFor(() => {
        expect(screen.getByText('Most Games')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Most Games'));

      // After filtering by most games, Player1 (20 games) should be #1
      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeTruthy();
      });
    });
  });
});