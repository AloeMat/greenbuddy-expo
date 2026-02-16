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
    <View style={{ flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
      {/* Progress bar */}
      <View style={{ position: 'absolute', top: 48, left: 0, right: 0, paddingHorizontal: 24 }}>
        <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden' }}>
          <Animated.View
            entering={FadeIn}
            style={{ height: '100%', backgroundColor: '#10B981', width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Icon animation */}
      {icon && <Animated.View entering={ZoomIn.springify()}>{icon}</Animated.View>}

      {/* Title */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginTop: 24 }}
      >
        {title}
      </Animated.Text>

      {/* Text */}
      <Animated.Text
        entering={FadeIn.delay(400)}
        style={{ fontSize: 16, color: '#4B5563', textAlign: 'center', marginTop: 16 }}
      >
        {text}
      </Animated.Text>
    </View>
  );
}
