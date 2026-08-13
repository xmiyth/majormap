import React, { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({ mode: 'light', isDark: false, setMode: () => undefined });

export const ThemeProvider = ThemeContext.Provider;
export const useTheme = () => useContext(ThemeContext);

export const darkModeAccent = (hex: string) => {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return hex;
  const brighten = (channel: string) => Math.round(parseInt(channel, 16) * .68 + 255 * .32).toString(16).padStart(2, '0');
  return `#${brighten(value.slice(0, 2))}${brighten(value.slice(2, 4))}${brighten(value.slice(4, 6))}`;
};
