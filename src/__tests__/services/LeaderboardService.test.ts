import { LeaderboardService } from '../../services/LeaderboardService';
import { UserIdentityService } from '../../services/UserIdentityService';
import { GameType, LeaderboardResponse, SubmitScoreResponse } from '../../types';

// Mock the UserIdentityService
jest.mock('../../services/UserIdentityService');
const mockUserIdentityService = UserIdentityService as jest.Mocked<typeof UserIdentityService>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock process.env
const mockEnv = {
  EXPO_PUBLIC_API_URL: 'https://test-api.sprinttap.com'
};
Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true,
});

describe('LeaderboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('submitScore', () => {
    const mockSessionData = {
      bestTime: 250,
      averageTime: 300,
      gamesPlayed: 5,
      accuracy: 80,
      attempts: [],
      statistics: {},
    };

    it('should submit score successfully when user is opted in', async () => {
      // Mock user identity
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      // Mock successful API response
      const mockResponse: SubmitScoreResponse = {
        success: true,
        newRank: 15,
        previousRank: 20,
        isNewRecord: true,
        leaderboardEntry: {
          id: 'test-entry',
          userId: 'test-uuid',
          nickname: 'TestPlayer',
          gameType: 'TAP_TEST',
          bestTime: 250,
          averageTime: 300,
          gamesPlayed: 5,
          accuracy: 80,
          timestamp: Date.now(),
          rank: 15,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await LeaderboardService.submitScore('TAP_TEST', mockSessionData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.sprinttap.com/v1/leaderboard/submit',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test-uuid'),
        })
      );
    });

    it('should throw error when user is not opted in', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: false,
      });

      await expect(
        LeaderboardService.submitScore('TAP_TEST', mockSessionData)
      ).rejects.toThrow('User not opted in to leaderboard or nickname not set');
    });

    it('should throw error when nickname is not set', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: '',
        isOptedIn: true,
      });

      await expect(
        LeaderboardService.submitScore('TAP_TEST', mockSessionData)
      ).rejects.toThrow('User not opted in to leaderboard or nickname not set');
    });

    it('should handle API error response', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        LeaderboardService.submitScore('TAP_TEST', mockSessionData)
      ).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network error', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        LeaderboardService.submitScore('TAP_TEST', mockSessionData)
      ).rejects.toThrow('Network error');
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard successfully with user ID', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      const mockResponse: LeaderboardResponse = {
        entries: [
          {
            id: 'entry-1',
            userId: 'user-1',
            nickname: 'Player1',
            gameType: 'TAP_TEST',
            bestTime: 200,
            averageTime: 250,
            gamesPlayed: 10,
            accuracy: 90,
            timestamp: Date.now(),
            rank: 1,
          },
        ],
        userStats: null,
        totalUsers: 100,
        lastUpdated: Date.now(),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await LeaderboardService.getLeaderboard('TAP_TEST', 50);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gameType=TAP_TEST&limit=50&userId=test-uuid'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should fetch leaderboard without user ID when not available', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: '',
        nickname: '',
        isOptedIn: false,
      });

      const mockResponse: LeaderboardResponse = {
        entries: [],
        userStats: null,
        totalUsers: 0,
        lastUpdated: Date.now(),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await LeaderboardService.getLeaderboard('TAP_TEST');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gameType=TAP_TEST&limit=100'),
        expect.anything()
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.not.stringContaining('userId='),
        expect.anything()
      );
    });

    it('should handle API error in getLeaderboard', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(
        LeaderboardService.getLeaderboard('TAP_TEST')
      ).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('getUserStats', () => {
    it('should return user stats when user ID exists', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      const mockStats = {
        userId: 'test-uuid',
        nickname: 'TestPlayer',
        bestRank: 5,
        currentRank: 10,
        totalGamesPlayed: 50,
        bestTime: 180,
        averageTime: 220,
        accuracy: 85,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats),
      } as Response);

      const result = await LeaderboardService.getUserStats('TAP_TEST');

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gameType=TAP_TEST&userId=test-uuid'),
        expect.anything()
      );
    });

    it('should return null when user ID does not exist', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: '',
        nickname: '',
        isOptedIn: false,
      });

      const result = await LeaderboardService.getUserStats('TAP_TEST');

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null when user not found (404)', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await LeaderboardService.getUserStats('TAP_TEST');

      expect(result).toBeNull();
    });

    it('should return null on other API errors', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await LeaderboardService.getUserStats('TAP_TEST');

      expect(result).toBeNull();
    });
  });

  describe('checkScoreQualification', () => {
    it('should return qualification status', async () => {
      const mockResponse = {
        qualifies: true,
        estimatedRank: 25,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await LeaderboardService.checkScoreQualification('TAP_TEST', 200);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gameType=TAP_TEST&bestTime=200'),
        expect.anything()
      );
    });

    it('should handle API error and return false qualification', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await LeaderboardService.checkScoreQualification('TAP_TEST', 200);

      expect(result).toEqual({ qualifies: false });
    });

    it('should handle network error and return false qualification', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await LeaderboardService.checkScoreQualification('TAP_TEST', 200);

      expect(result).toEqual({ qualifies: false });
    });
  });

  describe('getMockLeaderboard', () => {
    it('should generate mock leaderboard data', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      const result = await LeaderboardService.getMockLeaderboard('TAP_TEST');

      expect(result.entries).toHaveLength(10);
      expect(result.entries[0].rank).toBe(1);
      expect(result.entries[0].gameType).toBe('TAP_TEST');
      expect(result.userStats).toBeTruthy();
      expect(result.userStats?.nickname).toBe('TestPlayer');
      expect(result.totalUsers).toBe(1500);
      expect(typeof result.lastUpdated).toBe('number');
    });

    it('should generate mock data without user stats when no nickname', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: '',
        isOptedIn: false,
      });

      const result = await LeaderboardService.getMockLeaderboard('TAP_TEST');

      expect(result.entries).toHaveLength(10);
      expect(result.userStats).toBeNull();
    });

    it('should generate different data for different game types', async () => {
      mockUserIdentityService.getUserIdentity.mockResolvedValue({
        uuid: 'test-uuid',
        nickname: 'TestPlayer',
        isOptedIn: true,
      });

      const tapTestData = await LeaderboardService.getMockLeaderboard('TAP_TEST');
      const audioTestData = await LeaderboardService.getMockLeaderboard('AUDIO_TEST');

      expect(tapTestData.entries[0].gameType).toBe('TAP_TEST');
      expect(audioTestData.entries[0].gameType).toBe('AUDIO_TEST');
    });
  });

  describe('healthCheck', () => {
    it('should return true when service is healthy', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      } as Response);

      const result = await LeaderboardService.healthCheck();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.sprinttap.com/v1/health',
        expect.objectContaining({
          method: 'GET',
          timeout: 5000,
        })
      );
    });

    it('should return false when service is unhealthy', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      } as Response);

      const result = await LeaderboardService.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await LeaderboardService.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('getApiUrl', () => {
    it('should construct correct API URL with custom base URL', () => {
      // Access private method through bracket notation for testing
      const getApiUrl = (LeaderboardService as any).getApiUrl;
      const url = getApiUrl('test-endpoint');
      
      expect(url).toBe('https://test-api.sprinttap.com/v1/test-endpoint');
    });

    it('should use default URL when env var not set', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      delete process.env.EXPO_PUBLIC_API_URL;

      const getApiUrl = (LeaderboardService as any).getApiUrl;
      const url = getApiUrl('test-endpoint');
      
      expect(url).toBe('https://api.sprinttap.com/v1/test-endpoint');

      // Restore original value
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });
  });
});