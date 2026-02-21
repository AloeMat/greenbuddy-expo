import { DashboardTabsLayout } from '@/features/dashboard/layouts';

/**
 * Tabs Layout (Group Layout)
 *
 * Renders the main app interface with bottom navigation tabs.
 * This layout delegates to the dashboard feature's DashboardTabsLayout component
 * as part of Phase 5 layout encapsulation in FSD architecture.
 *
 * Primary auth guard is in app/index.tsx.
 * This layout adds a defensive redirect for deep-link / direct navigation
 * scenarios that bypass index.tsx routing.
 */
export default function TabsLayout() {
  return <DashboardTabsLayout />;
}
