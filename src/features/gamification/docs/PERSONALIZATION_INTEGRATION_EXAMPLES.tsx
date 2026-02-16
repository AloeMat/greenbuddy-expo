/**
 * Personalization Integration Examples
 * ════════════════════════════════════════════════════════════════════
 *
 * Copy & paste examples showing how to integrate personalization into:
 * - Screens (app/(tabs)/)
 * - Components (src/features/)
 * - Services (src/services/)
 *
 * Phase 4.2: Human Design Integration
 */

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 1: Dashboard with Personalized Tip & Notification
// ═══════════════════════════════════════════════════════════════════

/**
 * app/(tabs)/index.tsx - Home Screen with Personalized Tips
 *
 * Shows a different tip on dashboard based on caregiver profile:
 * - Forgetful: Reminder to check regularly
 * - Stressed: Reassurance tips
 * - Passionate: Challenge suggestions
 */
export const DashboardExample = () => {
  // ✅ Import personalization
  // import { usePersonalization, PersonalizationService } from '@/features/gamification';
  // import { useAuth } from '@/context/AuthContext';

  // const { setup } = usePersonalization();
  // const { user } = useAuth();

  // ✅ Get personalized tip for caregiver profile
  // const tip = setup
  //   ? PersonalizationService.getDashboardTip(setup.caregiver_profile)
  //   : 'Bienvenue!';

  // ✅ Render with AlertCard
  // return (
  //   <ScrollView>
  //     {/* Existing dashboard content */}
  //     <AlertCard variant="info" title="💡 Conseil Personnalisé">
  //       <Text>{tip}</Text>
  //     </AlertCard>
  //
  //     {/* Rest of dashboard */}
  //   </ScrollView>
  // );

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 2: Plant Detail Screen with Personalized Avatar Replies
// ═══════════════════════════════════════════════════════════════════

/**
 * app/plants/[id].tsx - Plant Detail with Personalized Vocal Interaction
 *
 * When user taps "Talk to Plant", generates reply with their chosen tone:
 * - Funny: Humorous, playful replies
 * - Gentle: Warm, encouraging tone
 * - Expert: Scientific, informative tone
 */
export const PlantDetailExample = () => {
  // ✅ Import what you need
  // import { usePersonalization, generateContextualReply } from '@/features/gamification';
  // import { useAttachment } from '@/features/gamification';

  // const { setup } = usePersonalization();
  // const attachment = useAttachment(plantId);
  // const [reply, setReply] = useState<ContextualReply | null>(null);

  // ✅ When user talks to plant
  // const handleTalkToPlant = async () => {
  //   // Build context
  //   const context = {
  //     plant: {
  //       plantId: plant.id,
  //       plantName: plant.name,
  //       personality: plant.personality,
  //       plantHealth: plant.health_percentage,
  //       daysSinceWatered: calculateDaysSince(plant.last_watered_at),
  //       daysSinceFertilized: calculateDaysSince(plant.last_fertilized_at),
  //       dayWithUser: attachment?.daysTogether || 0,
  //       temperature: weatherData?.temperature,
  //       humidity: weatherData?.humidity,
  //     },
  //     user: {
  //       userId: user.id,
  //       userName: user.display_name,
  //       totalPlantsOwned: plantsCount,
  //       userStreak: currentStreak,
  //       userLevel: userLevel,
  //       recentInteractions: ['water', 'check_in'],
  //     },
  //     weather: weatherData,
  //   };
  //
  //   // ✅ Generate reply with personality (IMPORTANT!)
  //   const result = await generateContextualReply(
  //     context,
  //     setup?.avatar_personality  // Pass the personality!
  //   );
  //   setReply(result);
  //
  //   // Play TTS with personality tone
  //   await playTTS(result.text, setup?.avatar_personality);
  // };

  // ✅ Render VocalInteraction component
  // return (
  //   <ScrollView>
  //     {/* Plant info */}
  //     <Button
  //       label="🗣️ Parlez à votre plante"
  //       onPress={handleTalkToPlant}
  //     />
  //
  //     {reply && (
  //       <VocalInteraction
  //         reply={reply}
  //         emotion={reply.emotion}
  //         attachment={attachment}
  //         onTalkAgain={handleTalkToPlant}
  //       />
  //     )}
  //   </ScrollView>
  // );

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 3: App Layout - Initialize Personalized Notifications
// ═══════════════════════════════════════════════════════════════════

/**
 * app/_layout.tsx - Root Layout with Personalized Notification Setup
 *
 * When app starts:
 * 1. Detect if user has human design setup
 * 2. Schedule daily check-in with personalized message & time
 * 3. Adjust time based on caregiver profile
 */
export const RootLayoutExample = () => {
  // ✅ Import notifications & personalization
  // import {
  //   usePersonalization,
  //   scheduleDailyCheckInNotification,
  //   rescheduleDailyNotification,
  // } from '@/features/gamification';
  // import { useAuth } from '@/context/AuthContext';

  // const { user } = useAuth();
  // const { setup } = usePersonalization();

  // ✅ Schedule notifications when setup loads
  // useEffect(() => {
  //   if (!user || !setup) return;
  //
  //   // Choose time based on caregiver profile
  //   let notificationHour = 10; // Default 10 AM
  //   if (setup.caregiver_profile === 'forgetful') {
  //     notificationHour = 9; // Earlier reminder
  //   } else if (setup.caregiver_profile === 'stressed') {
  //     notificationHour = 11; // Later, less intrusive
  //   }
  //
  //   // Schedule with personalization
  //   scheduleDailyCheckInNotification(setup, notificationHour);
  // }, [user?.id, setup?.id]);

  // ✅ Reschedule if user updates preferences
  // const handleUpdatePreferences = async (newSetup: HumanDesignSetup) => {
  //   const hour = newSetup.caregiver_profile === 'forgetful' ? 9 : 10;
  //   await rescheduleDailyNotification(newSetup, hour);
  // };

  // return <Slot />;

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 4: Watering Reminder Service - Personalized by Frequency
// ═══════════════════════════════════════════════════════════════════

/**
 * hooks/useWateringReminders.ts - Enhanced with Personalization
 *
 * Adjust watering reminder frequency based on user's watering rhythm:
 * - 1x_week: Remind every 7 days
 * - 2x_week: Remind every 3-4 days
 * - 3x_week: Remind every 2 days
 * - daily: Remind every day
 */
export const WateringRemindersExample = () => {
  // ✅ In your useWateringReminders hook, add personalization:

  // import { usePersonalization, PersonalizationService } from '@/features/gamification';

  // export function useWateringReminders(plantId: string) {
  //   const { setup } = usePersonalization();
  //   const plant = usePlant(plantId);
  //
  //   // Get notification frequency from setup
  //   const frequencyDays = setup
  //     ? PersonalizationService.getNotificationFrequency(setup)
  //     : 3; // Default 3 days
  //
  //   // Calculate next watering date
  //   const nextWateringDate = new Date(plant.last_watered_at);
  //   nextWateringDate.setDate(nextWateringDate.getDate() + frequencyDays);
  //
  //   // Schedule reminder for that date
  //   useEffect(() => {
  //     if (nextWateringDate > now) {
  //       scheduleWateringReminder(plantId, nextWateringDate);
  //     }
  //   }, [frequencyDays, plant.last_watered_at]);
  // }

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 5: Achievement Unlock Messages - Personalized Style
// ═══════════════════════════════════════════════════════════════════

/**
 * features/gamification/hooks/useGamification.ts - Achievement Messages
 *
 * When user unlocks achievement, show personalized alert:
 * - Gentle: "Bravo! Vous avez déverrouillé un accomplissement."
 * - Strict: "🏆 Accomplissement Déverrouillé!"
 * - Motivational: "🎉 Succès! Vous gagnez des XP!"
 */
export const AchievementUnlockExample = () => {
  // ✅ In your achievement unlock handler:

  // const handleAchievementUnlock = async (achievementId: string) => {
  //   const achievement = getAchievementById(achievementId);
  //   const { setup } = usePersonalization();
  //
  //   // Get personalized message
  //   const message = setup
  //     ? PersonalizationService.getNotificationMessage(setup, 'achievement')
  //     : { title: '⭐ Bien joué!', body: 'Nouvel accomplissement!' };
  //
  //   // Show alert with personalized style
  //   Alert.alert(message.title, `${message.body}\n\n+${achievement.reward}XP`);
  //
  //   // Play success sound (different for each style)
  //   const soundFile = setup?.notification_style === 'gentle'
  //     ? 'success-soft.mp3'
  //     : 'success-loud.mp3';
  //   playSound(soundFile);
  // };

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 6: Settings Screen - Allow Users to Change Preferences
// ═══════════════════════════════════════════════════════════════════

/**
 * app/settings.tsx - Settings Screen with Preference Updates
 *
 * Allow users to change their personalization preferences later:
 * - Avatar personality
 * - Notification style
 * - Notification time
 */
export const SettingsScreenExample = () => {
  // ✅ Settings screen with preference updates:

  // import {
  //   usePersonalization,
  //   PersonalizationService,
  //   rescheduleDailyNotification,
  // } from '@/features/gamification';

  // const handleUpdateAvatarPersonality = async (newPersonality: AvatarPersonalityType) => {
  //   const { error } = await supabase
  //     .from('human_design_setups')
  //     .update({
  //       avatar_personality: newPersonality,
  //       updated_at: new Date().toISOString(),
  //     })
  //     .eq('user_id', user.id);
  //
  //   if (!error) {
  //     // Clear cache and reload
  //     PersonalizationService.clearCache();
  //     refetch(); // Trigger usePersonalization refetch
  //     Alert.alert('✅ Préférence mise à jour!');
  //   }
  // };
  //
  // const handleUpdateNotificationTime = async (hour: number) => {
  //   const newSetup = { ...setup, updated_at: new Date().toISOString() };
  //   await rescheduleDailyNotification(newSetup, hour);
  //   PersonalizationService.clearCache();
  //   refetch();
  // };

  // return (
  //   <ScrollView>
  //     <SelectField
  //       label="Personnalité d'Avatar"
  //       value={setup?.avatar_personality}
  //       options={['funny', 'gentle', 'expert']}
  //       onChange={handleUpdateAvatarPersonality}
  //     />
  //
  //     <SelectField
  //       label="Style de Notification"
  //       value={setup?.notification_style}
  //       options={['gentle', 'strict', 'motivational']}
  //       onChange={handleUpdateNotificationStyle}
  //     />
  //
  //     <TimeField
  //       label="Heure de Check-in"
  //       value={extractHourFromTime(setup?.notification_time)}
  //       onChange={handleUpdateNotificationTime}
  //     />
  //   </ScrollView>
  // );

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 7: Analytics - Track Personalization Preferences
// ═══════════════════════════════════════════════════════════════════

/**
 * services/analytics.ts - Track User Personalization
 *
 * Log what personalization preferences users select to understand:
 * - Which avatar personality is most popular
 * - Which notification styles drive engagement
 * - Correlation between caregiver type and retention
 */
export const AnalyticsExample = () => {
  // ✅ When user completes onboarding:

  // import PostHog from 'posthog-react-native';

  // const handleOnboardingComplete = async (setup: HumanDesignSetup) => {
  //   // Track the personalization choices
  //   PostHog.capture('onboarding_completed', {
  //     avatar_personality: setup.avatar_personality,
  //     notification_style: setup.notification_style,
  //     caregiver_profile: setup.caregiver_profile,
  //     living_place: setup.living_place,
  //     watering_rhythm: setup.watering_rhythm,
  //     guilt_sensitivity: setup.guilt_sensitivity,
  //   });
  // };

  // ✅ When user updates personalization:
  // PostHog.capture('personalization_updated', {
  //   avatar_personality: newSetup.avatar_personality,
  //   changed_from: oldSetup.avatar_personality,
  // });

  // ✅ Track daily check-in engagement by notification style:
  // const handleDailyCheckIn = () => {
  //   PostHog.capture('daily_checkin_completed', {
  //     notification_style: setup?.notification_style,
  //     time_since_notification: timeSinceNotification,
  //   });
  // };

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// EXAMPLE 8: Testing - Unit Test PersonalizationService
// ═══════════════════════════════════════════════════════════════════

/**
 * __tests__/personalizationService.test.ts
 *
 * Example unit tests for the personalization service
 */
export const PersonalizationTestsExample = () => {
  // describe('PersonalizationService', () => {
  //   it('should load setup from database', async () => {
  //     const setup = await PersonalizationService.loadSetup('user-123');
  //     expect(setup.user_id).toBe('user-123');
  //     expect(setup.avatar_personality).toBeDefined();
  //   });
  //
  //   it('should return defaults for new users', async () => {
  //     const setup = await PersonalizationService.loadSetup('unknown-user');
  //     expect(setup.avatar_personality).toBe('gentle');
  //     expect(setup.notification_style).toBe('motivational');
  //   });
  //
  //   it('should cache results', async () => {
  //     const setup1 = await PersonalizationService.loadSetup('user-123');
  //     const setup2 = await PersonalizationService.loadSetup('user-123');
  //     expect(setup1).toEqual(setup2);
  //     // Second call should use cache (no DB query)
  //   });
  //
  //   it('should apply correct tone for funny personality', () => {
  //     const tone = PersonalizationService.getPersonalityEmotionFilter('funny');
  //     expect(tone).toContain('excited');
  //     expect(tone).toContain('playful');
  //   });
  //
  //   it('should generate gentle notification message', () => {
  //     const setup = { notification_style: 'gentle' };
  //     const msg = PersonalizationService.getNotificationMessage(setup, 'daily_checkin');
  //     expect(msg.body).toContain('quand vous avez');
  //   });
  // });

  return null; // Pseudo code
};

// ═══════════════════════════════════════════════════════════════════
// QUICK REFERENCE
// ═══════════════════════════════════════════════════════════════════

/**
 * IMPORTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * // Hooks
 * import {
 *   usePersonalization,        // Full setup + loading state
 *   useNotificationStyle,      // Just notification style
 *   useAvatarPersonality,      // Just avatar personality
 * } from '@/features/gamification';
 *
 * // Services
 * import {
 *   PersonalizationService,         // Core service class
 *   loadPersonalizationSetup,       // Function to load setup
 *   getPersonalizedNotification,    // Function to get message
 * } from '@/features/gamification';
 *
 * // Types
 * import type {
 *   HumanDesignSetup,               // Full setup type
 *   AvatarPersonalityType,          // 'funny' | 'gentle' | 'expert'
 *   CaregiverProfile,               // 'forgetful' | 'stressed' | 'passionate'
 * } from '@/types/humanDesign';
 *
 *
 * COMMON METHODS
 * ═══════════════════════════════════════════════════════════════════
 *
 * // Load setup for user
 * const setup = await PersonalizationService.loadSetup(userId);
 *
 * // Get notification frequency (days)
 * const freq = PersonalizationService.getNotificationFrequency(setup);
 *
 * // Get notification style ('gentle' | 'strict' | 'motivational')
 * const style = PersonalizationService.getNotificationStyle(setup);
 *
 * // Get avatar personality ('funny' | 'gentle' | 'expert')
 * const personality = PersonalizationService.getAvatarPersonality(setup);
 *
 * // Get personalized notification message
 * const msg = PersonalizationService.getNotificationMessage(
 *   setup,
 *   'daily_checkin' // or 'watering_reminder' or 'achievement'
 * );
 *
 * // Get dashboard tip for caregiver
 * const tip = PersonalizationService.getDashboardTip(setup.caregiver_profile);
 *
 * // Clear cache (after updates)
 * PersonalizationService.clearCache();
 *
 *
 * HOOK USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 * const { setup, isLoading, error, refetch } = usePersonalization();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return <Text>{setup?.avatar_personality}</Text>;
 *
 *
 * IN SCREENS / COMPONENTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * // Generate reply with personality
 * const reply = await generateContextualReply(context, setup?.avatar_personality);
 *
 * // Schedule notification with setup
 * await scheduleDailyCheckInNotification(setup, 10);
 *
 * // Reschedule when preferences change
 * await rescheduleDailyNotification(setup, 10);
 */

export default null;
