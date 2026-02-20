import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/lib/hooks/use-theme-color';
import { typography } from '@/design-system/tokens/typography';
import { COLORS } from '@/design-system/tokens/colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: typography.body.lg.fontFamily,
    fontSize: typography.body.lg.fontSize,
    lineHeight: typography.body.lg.lineHeight,
  },
  defaultSemiBold: {
    fontFamily: typography.subtitle.md.fontFamily,
    fontSize: typography.subtitle.md.fontSize,
    lineHeight: typography.subtitle.md.lineHeight,
    fontWeight: typography.weights.semiBold,
  },
  title: {
    fontFamily: typography.heading.h1.fontFamily,
    fontSize: typography.heading.h1.fontSize,
    lineHeight: typography.heading.h1.lineHeight,
    fontWeight: typography.heading.h1.fontWeight,
  },
  subtitle: {
    fontFamily: typography.heading.h4.fontFamily,
    fontSize: typography.heading.h4.fontSize,
    lineHeight: typography.heading.h4.lineHeight,
    fontWeight: typography.heading.h4.fontWeight,
  },
  link: {
    fontFamily: typography.body.lg.fontFamily,
    fontSize: typography.body.lg.fontSize,
    lineHeight: 30,
    color: COLORS.brand,
  },
});
