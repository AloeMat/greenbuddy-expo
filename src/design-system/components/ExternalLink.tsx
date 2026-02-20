/**
 * ExternalLink Component
 * Opens links in browser instead of in-app
 */

import { Linking, Text, TextProps } from 'react-native';
import { logger } from '@/lib/services/logger';

interface ExternalLinkProps extends TextProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children, ...rest }: Readonly<ExternalLinkProps>) {
  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(href);
      if (supported) {
        await Linking.openURL(href);
      }
    } catch (error) {
      logger.error('Error opening URL:', error);
    }
  };

  return (
    <Text
      onPress={handlePress}
      style={[rest.style, { color: '#0a7ea4', textDecorationLine: 'underline' }]}
      {...rest}
    >
      {children}
    </Text>
  );
}
