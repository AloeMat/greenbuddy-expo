/**
 * Error Boundary Component
 * Catches unhandled errors and displays them
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { logger } from '@lib/services/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('🚨 ErrorBoundary caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo?.componentStack || '',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>💥 Something went wrong!</Text>

            <Text style={styles.label}>Error Message:</Text>
            <Text style={styles.errorText}>{this.state.error?.toString()}</Text>

            <Text style={styles.label}>Stack Trace:</Text>
            <Text style={styles.stackText}>
              {this.state.error?.stack || 'No stack trace available'}
            </Text>

            {this.state.errorInfo && (
              <>
                <Text style={styles.label}>Component Stack:</Text>
                <Text style={styles.stackText}>{this.state.errorInfo}</Text>
              </>
            )}
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff3cd',
    paddingTop: 40,
  },
  errorContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    color: '#c62828',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 10,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    color: '#333',
    fontFamily: 'monospace',
  },
});
