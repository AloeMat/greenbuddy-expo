export type NotificationBehavior = {
  shouldShowAlert?: boolean;
  shouldPlaySound?: boolean;
  shouldSetBadge?: boolean;
  shouldShowBanner?: boolean;
  shouldShowList?: boolean;
};

export const AndroidImportance = {
  MAX: 'max',
} as const;

export function setNotificationHandler(): void {
  return;
}

export async function setNotificationChannelAsync(): Promise<void> {
  return;
}

export async function scheduleNotificationAsync(): Promise<string> {
  return 'mock-notification-id';
}

export async function cancelNotificationAsync(): Promise<void> {
  return;
}
