import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { ko, en, TranslationKeys } from '../localization/translations';
import { LocalStorageService } from '../services/storage';

export type Language = 'ko' | 'en';

const translations = {
  ko,
  en,
};

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationKeys;
  formatMessage: (key: string, params?: Record<string, any>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ko');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await LocalStorageService.getItem('language');
      if (savedLanguage && ['ko', 'en'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      } else {
        // Detect system language using RN's built-in locale detection
        const detectedLanguage: Language = 'ko'; // Default to Korean for now
        setLanguageState(detectedLanguage);
        await LocalStorageService.setItem('language', detectedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      setLanguageState('ko'); // Fallback to Korean
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      await LocalStorageService.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const formatMessage = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'function' && params) {
      return value(params);
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LocalizationContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t: translations[language], 
        formatMessage 
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};