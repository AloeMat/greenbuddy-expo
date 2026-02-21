import { AuthFlowLayout } from '@/features/auth/layouts';

/**
 * Auth Layout (Group Layout)
 *
 * Routes authentication-related screens (login, register).
 * This layout delegates to the auth feature's AuthFlowLayout component
 * as part of Phase 5 layout encapsulation in FSD architecture.
 */
export default function AuthLayout() {
  return <AuthFlowLayout />;
}
