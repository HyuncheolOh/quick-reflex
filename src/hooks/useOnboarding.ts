import { useState, useEffect } from 'react';
import { LocalStorageService } from '../services/storage';
import { UserProfile } from '../types';

export const useOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if onboarding is completed
      const completed = await LocalStorageService.isOnboardingCompleted();
      setIsCompleted(completed);
      
      // Get user profile if exists
      if (completed) {
        const profile = await LocalStorageService.getUserProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to not completed if there's an error
      setIsCompleted(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (profileData?: Partial<UserProfile>) => {
    try {
      // Create or update user profile
      let profile: UserProfile;
      
      if (userProfile) {
        profile = { ...userProfile, ...profileData };
      } else {
        profile = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          onboardingCompleted: true,
          preferences: {
            soundEnabled: true,
            vibrationEnabled: true,
          },
          ...profileData,
        };
      }
      
      await LocalStorageService.setUserProfile(profile);
      await LocalStorageService.setOnboardingCompleted(true);
      
      setUserProfile(profile);
      setIsCompleted(true);
      
      return profile;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await LocalStorageService.clearAllData();
      setIsCompleted(false);
      setUserProfile(null);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  return {
    isLoading,
    isCompleted,
    userProfile,
    completeOnboarding,
    resetOnboarding,
    refresh: checkOnboardingStatus,
  };
};