import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { router } from 'expo-router';

interface FeedbackScreenProps {
  title: string;
  text: string;
  icon?: React.ReactNode; // Lucide icon or animation
  autoAdvanceMs: number; // 2000, 2500, 3000
  nextRoute: string; // '/onboarding/page4'
  progress: number; // 25, 35, 75
}

export function FeedbackScreen({
  title,
  text,
  icon,
  autoAdvanceMs,
  nextRoute,
  progress,
}: FeedbackScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(nextRoute);
    }, autoAdvanceMs);

    return () => clearTimeout(timer);
  }, [autoAdvanceMs, nextRoute]);

  return (
    <View className="flex-1 bg-green-50 justify-center items-center px-6">
      {/* Progress bar */}
      <View className="absolute top-12 left-0 right-0 px-6">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            entering={FadeIn}
            className="h-full bg-green-500"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Icon animation */}
      {icon && <Animated.View entering={ZoomIn.springify()}>{icon}</Animated.View>}

      {/* Title */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        className="text-2xl font-bold text-green-900 text-center mt-6"
      >
        {title}
      </Animated.Text>

      {/* Text */}
      <Animated.Text
        entering={FadeIn.delay(400)}
        className="text-base text-gray-700 text-center mt-4"
      >
        {text}
      </Animated.Text>
    </View>
  );
}
