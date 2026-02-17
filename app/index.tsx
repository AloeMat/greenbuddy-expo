/**
 * Root Index - Simple Redirect
 *
 * Just redirects to (tabs), letting Expo Router handle the rest
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
