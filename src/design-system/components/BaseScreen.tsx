/**
 * BaseScreen Component - Template Method Pattern
 * Defines screen layout template with customizable sections
 * Provides consistent UI/UX across all app screens
 *
 * Structure:
 * ┌─────────────────────────────┐
 * │      Header (optional)      │  <- renderHeader()
 * ├─────────────────────────────┤
 * │      Content (scrollable)   │  <- renderContent()
 * ├─────────────────────────────┤
 * │      Footer (optional)      │  <- renderFooter()
 * └─────────────────────────────┘
 */

import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  ScrollViewProps,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from './Button';
import { radius } from '@tokens/radius';
import { colors } from '@tokens/colors';
import { spacing } from '@tokens/spacing';

interface BaseScreenProps {
  /**
   * Screen title displayed in header
   */
  title?: string;

  /**
   * Show back button in header
   */
  showBackButton?: boolean;

  /**
   * Show header section
   */
  showHeader?: boolean;

  /**
   * Custom header actions (right side of header)
   */
  headerActions?: ReactNode;

  /**
   * Footer content
   */
  footer?: ReactNode;

  /**
   * Whether screen is loading
   */
  loading?: boolean;

  /**
   * Error message to display
   */
  error?: string | null;

  /**
   * Callback when user pulls to refresh
   */
  onRefresh?: () => Promise<void>;

  /**
   * Whether to show refresh control
   */
  refreshable?: boolean;

  /**
   * Main content
   */
  children: ReactNode;

  /**
   * Custom content container style
   */
  contentStyle?: ViewStyle;

  /**
   * Props to pass to ScrollView
   */
  scrollViewProps?: ScrollViewProps;

  /**
   * Custom header style
   */
  headerStyle?: ViewStyle;

  /**
   * Whether to disable scroll
   */
  disableScroll?: boolean;
}

/**
 * BaseScreen Component
 * Template Method Pattern implementation
 *
 * Subclasses customize by:
 * 1. Setting title, showBackButton, etc. via props
 * 2. Passing custom header actions
 * 3. Rendering custom footer
 * 4. Providing main content via children
 *
 * @example
 * ```typescript
 * function GardenScreen() {
 *   return (
 *     <BaseScreen
 *       title="Mon Jardin"
 *       showBackButton={false}
 *       headerActions={<PlusIcon />}
 *       footer={<Button label="Ajouter plante" />}
 *     >
 *       <PlantList plants={plants} />
 *     </BaseScreen>
 *   );
 * }
 * ```
 */
export const BaseScreen: React.FC<BaseScreenProps> = ({
  title,
  showBackButton = true,
  showHeader = true,
  headerActions,
  footer,
  loading = false,
  error = null,
  onRefresh,
  refreshable = true,
  children,
  contentStyle,
  scrollViewProps,
  headerStyle,
  disableScroll = false
}) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  /**
   * Template Method: Handle refresh
   */
  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Template Method: Render header
   * Override by passing props
   */
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        {/* Left: Back button */}
        {showBackButton && (
          <Button
            variant="outlined"
            size="small"
            onPress={() => router.back()}
            label="←"
            style={styles.backButton}
          />
        )}

        {/* Center: Title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Right: Custom actions */}
        <View style={styles.headerActions}>{headerActions}</View>
      </View>
    );
  };

  /**
   * Template Method: Render loading state
   */
  const renderLoading = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary['500']} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  };

  /**
   * Template Method: Render error state
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  };

  /**
   * Template Method: Render main content
   */
  const renderContent = () => {
    const content = (
      <View style={[styles.contentContainer, contentStyle]}>
        {renderLoading()}
        {renderError()}
        {!loading && !error && children}
      </View>
    );

    if (disableScroll) {
      return content;
    }

    return (
      <ScrollView
        {...scrollViewProps}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          refreshable && onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary['500']}
            />
          ) : undefined
        }
      >
        {content}
      </ScrollView>
    );
  };

  /**
   * Template Method: Render footer
   */
  const renderFooter = () => {
    if (!footer) return null;

    return <View style={styles.footer}>{footer}</View>;
  };

  /**
   * Template Method: Render complete screen
   * Structure: Header → Content → Footer
   */
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      {renderHeader()}

      {/* Content Section (scrollable) */}
      {renderContent()}

      {/* Footer Section */}
      {renderFooter()}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral['50']
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral['200'],
    backgroundColor: '#FFFFFF'
  } as ViewStyle,

  backButton: {
    marginRight: spacing.sm
  } as ViewStyle,

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral['900']
  } as any,

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm
  } as ViewStyle,

  scrollView: {
    flex: 1
  } as ViewStyle,

  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl
  } as ViewStyle,

  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  } as ViewStyle,

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl
  } as ViewStyle,

  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral['600'],
    fontSize: 14
  } as any,

  errorContainer: {
    backgroundColor: colors.error['50'],
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error['500']
  } as ViewStyle,

  errorText: {
    color: colors.error['700'],
    fontSize: 14,
    fontWeight: '500'
  } as any,

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral['200'],
    backgroundColor: '#FFFFFF'
  } as ViewStyle
};
