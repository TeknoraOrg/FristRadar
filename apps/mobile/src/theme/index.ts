export { lightColors as colors } from './colors';
export type { ColorScheme } from './colors';

export const typography = {
  fontFamily: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System' },
  fontSize: { xs: 13, sm: 15, base: 17, lg: 19, xl: 22, '2xl': 26, '3xl': 32, '4xl': 38 },
  fontWeight: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const },
  lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
};

export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 40, '4xl': 48, '5xl': 64 };

export const borderRadius = { sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, full: 9999 };
