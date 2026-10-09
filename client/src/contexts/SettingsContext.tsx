import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformSettings } from '../types';
import { api } from '../services/api';

interface SettingsContextType {
  settings: PlatformSettings;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
}

const defaultSettings: PlatformSettings = {
  id: 'default',
  platformName: 'KIT Helping Hand',
  tagline: 'Your Academic Resources, All in One Place.',
  institutionName: 'Khanpur Institute of Technology',
  logoUrl: null,
  contactEmail: 'academics@kit.edu.pk',
  maintenanceMode: false,
  maintenanceNotice: null,
  allowedFileTypes: 'pdf,docx,pptx,zip',
  maxFileSizeMb: 25,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);

  const refreshSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res) {
        setSettings(res);
      }
    } catch {
      // Fallback to default
    }
  };

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    const res = await api.updateSettings(newSettings);
    if (res.settings) {
      setSettings(res.settings);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
