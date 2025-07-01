export const themes = {
  dark: {
    // Material 3 Dark Theme Palette
    background: '#121212',            // M3 Dark - Background
    surface: '#1E1E1E',               // Surface Container
    surfaceHover: '#272727',
    border: '#2C2C2C',                // Outline Variant
    borderLight: '#242424',
    
    // Text colors
    text: '#E3E3E3',                  // On Surface
    textSecondary: '#B0B0B0',         // On Surface Variant
    textTertiary: '#8C8C8C',
    
    // Accent colors (Material Indigo / Deep Purple)
    primary: '#BB86FC',               // Primary
    primaryHover: '#9F6DF4',
    secondary: '#03DAC6',             // Secondary
    secondaryHover: '#00BDAA',
    
    // Status colors (Material standard)
    success: '#4CAF50',
    warning: '#FFC107',
    error:   '#F44336',
    info:    '#2196F3',
    
    // Component specific
    inputBg: '#1E1E1E',
    inputBorder: '#333333',
    inputFocus: '#BB86FC',
    buttonBg: '#2A2A2A',
    buttonHover: '#383838',
    scrollbar: '#383838',
    scrollbarHover: '#4B4B4B',
    
    // Shadows (Material Elevation)
    shadow: 'rgba(0, 0, 0, 0.6)',
    shadowLight: 'rgba(0, 0, 0, 0.4)'
  },
  
  light: {
    // Material 3 Light Theme Palette
    background: '#FFFFFF',            // Background
    surface: '#FFFFFF',               // Surface Container
    surfaceHover: '#F4F4F4',
    border: '#E0E0E0',                // Outline
    borderLight: '#EEEEEE',
    
    // Text colors
    text: '#1C1B1F',                  // On Surface
    textSecondary: '#5C5C5C',         // On Surface Variant
    textTertiary: '#8C8C8C',
    
    // Accent colors (Material Indigo / Deep Purple)
    primary: '#6750A4',               // Primary
    primaryHover: '#5A4590',
    secondary: '#018786',             // Secondary
    secondaryHover: '#006D6C',
    
    // Status colors
    success: '#388E3C',
    warning: '#FFA000',
    error:   '#D32F2F',
    info:    '#1976D2',
    
    // Component specific
    inputBg: '#FFFFFF',
    inputBorder: '#C7C7C7',
    inputFocus: '#6750A4',
    buttonBg: '#F1F1F1',
    buttonHover: '#E0E0E0',
    scrollbar: '#C7C7C7',
    scrollbarHover: '#A0A0A0',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.14)',
    shadowLight: 'rgba(0, 0, 0, 0.08)'
  }
};

export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.dark;
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  root.setAttribute('data-theme', themeName);
  localStorage.setItem('theme', themeName);
}

export function getStoredTheme() {
  return localStorage.getItem('theme') || 'dark';
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
}