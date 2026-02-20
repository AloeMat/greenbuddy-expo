import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { logger } from '@/lib/services/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays a fallback UI
 * Prevents white screen of death
 */
export class AppErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error to monitoring service (Sentry, etc.)
    logger.error('[ErrorBoundary] Uncaught error:', error, { componentStack: errorInfo.componentStack });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background[200],
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: radius.lg,
              padding: spacing.lg,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Error Icon */}
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>
              ⚠️
            </Text>

            {/* Error Title */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.error[700],
                marginBottom: spacing.sm,
                textAlign: 'center',
              }}
            >
              Oups ! Une erreur est survenue
            </Text>

            {/* Error Message */}
            <Text
              style={{
                fontSize: 14,
                color: colors.text[600],
                marginBottom: spacing.lg,
                textAlign: 'center',
                lineHeight: 21,
              }}
            >
              {this.state.error.message ||
                'Une erreur inattendue s\'est produite'}
            </Text>

            {/* Development Details */}
            {__DEV__ && (
              <View
                style={{
                  width: '100%',
                  backgroundColor: colors.error[50],
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.error[500],
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.text[700],
                    fontFamily: 'monospace',
                    lineHeight: 16,
                  }}
                >
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            {/* Retry Button */}
            <TouchableOpacity
              onPress={this.resetError}
              style={{
                backgroundColor: colors.primary[600],
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.md,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                Réessayer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
