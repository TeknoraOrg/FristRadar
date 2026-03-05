export type ColorScheme = {
  primary: { default: string; light: string; dark: string; foreground: string };
  secondary: { default: string; light: string; dark: string; foreground: string };
  background: { primary: string; secondary: string; card: string };
  text: { primary: string; secondary: string; muted: string; inverse: string };
  border: { default: string; light: string; focus: string };
  status: { success: string; successLight: string; warning: string; warningLight: string; error: string; errorLight: string; info: string; infoLight: string };
  gray: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
};

export const lightColors: ColorScheme = {
  primary: { default: '#1B4F72', light: '#D6EAF8', dark: '#154360', foreground: '#ffffff' },
  secondary: { default: '#E67E22', light: '#FDEBD0', dark: '#CA6F1E', foreground: '#ffffff' },
  background: { primary: '#EBF0F5', secondary: '#F2F6FA', card: '#ffffff' },
  text: { primary: '#1C2833', secondary: '#5D6D7E', muted: '#5D6D7E', inverse: '#ffffff' },
  border: { default: '#D5DBDB', light: '#E8ECEF', focus: '#1B4F72' },
  status: {
    success: '#27AE60', successLight: '#D5F5E3',
    warning: '#F39C12', warningLight: '#FEF9E7',
    error: '#E74C3C', errorLight: '#FDEDEC',
    info: '#2E86C1', infoLight: '#D6EAF8',
  },
  gray: { 50: '#F8F9FA', 100: '#E8ECEF', 200: '#D5DBDB', 300: '#B3BFC6', 400: '#85929E', 500: '#5D6D7E', 600: '#4A5B6B', 700: '#354856', 800: '#273746', 900: '#1C2833' },
};

export const darkColors: ColorScheme = {
  primary: { default: '#5DADE2', light: '#1A3040', dark: '#3498DB', foreground: '#0E1A24' },
  secondary: { default: '#F0B27A', light: '#2C2215', dark: '#E67E22', foreground: '#0E1A24' },
  background: { primary: '#0E1A24', secondary: '#162633', card: '#1E3344' },
  text: { primary: '#ECF0F1', secondary: '#AAB7C4', muted: '#AAB7C4', inverse: '#0E1A24' },
  border: { default: '#34495E', light: '#2C3E50', focus: '#5DADE2' },
  status: {
    success: '#2ECC71', successLight: '#1A332A',
    warning: '#F5B041', warningLight: '#332A1A',
    error: '#EC7063', errorLight: '#331A1A',
    info: '#5DADE2', infoLight: '#1A3040',
  },
  gray: { 50: '#121E28', 100: '#1E3344', 200: '#2C3E50', 300: '#34495E', 400: '#4A5B6B', 500: '#5D6D7E', 600: '#85929E', 700: '#AAB7C4', 800: '#D5DBDB', 900: '#ECF0F1' },
};
