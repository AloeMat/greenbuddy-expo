/**
 * Migration: Create human_design_setups table
 * Date: 2026-02-12
 *
 * Stores user profiling data from onboarding human design questions
 * Used to personalize notifications, avatar personality, and recommendations
 */

-- Create enum types for human design
CREATE TYPE caregiver_profile_enum AS ENUM ('forgetful', 'stressed', 'passionate');
CREATE TYPE living_place_enum AS ENUM ('apartment', 'house', 'office');
CREATE TYPE watering_rhythm_enum AS ENUM ('1x_week', '2x_week', '3x_week', 'daily');
CREATE TYPE guilt_sensitivity_enum AS ENUM ('yes', 'somewhat', 'no');
CREATE TYPE avatar_personality_enum AS ENUM ('funny', 'gentle', 'expert');

-- Create human_design_setups table
CREATE TABLE public.human_design_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Human Design Questions (from Page 5 onboarding)
  caregiver_profile caregiver_profile_enum NOT NULL DEFAULT 'passionate',
  living_place living_place_enum NOT NULL DEFAULT 'apartment',
  watering_rhythm watering_rhythm_enum NOT NULL DEFAULT '2x_week',
  guilt_sensitivity guilt_sensitivity_enum NOT NULL DEFAULT 'no',
  avatar_personality avatar_personality_enum NOT NULL DEFAULT 'gentle',

  -- Computed fields for recommendations
  recommended_check_frequency INTEGER NOT NULL DEFAULT 3, -- days
  notification_style TEXT NOT NULL DEFAULT 'gentle', -- gentle | strict | motivational

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_user_id CHECK (user_id IS NOT NULL)
);

-- Create indexes
CREATE INDEX idx_human_design_user_id ON public.human_design_setups(user_id);
CREATE INDEX idx_human_design_updated_at ON public.human_design_setups(updated_at);

-- Enable RLS
ALTER TABLE public.human_design_setups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view/edit their own setup
CREATE POLICY "Users can view own human design setup"
  ON public.human_design_setups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own human design setup"
  ON public.human_design_setups
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own human design setup"
  ON public.human_design_setups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_human_design_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER human_design_update_timestamp
  BEFORE UPDATE ON public.human_design_setups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_human_design_updated_at();

-- Comment on table
COMMENT ON TABLE public.human_design_setups IS
'Stores user profiling data from onboarding Page 5 (Human Design Setup).
Used to personalize notifications, avatar responses, and watering schedules.';

COMMENT ON COLUMN public.human_design_setups.caregiver_profile IS
'User self-identified caregiving style: forgetful (needs reminders), stressed (busy), passionate (engaged)';

COMMENT ON COLUMN public.human_design_setups.living_place IS
'User living environment: apartment (limited space), house (outdoor access), office (work-only)';

COMMENT ON COLUMN public.human_design_setups.watering_rhythm IS
'Desired watering frequency: 1x_week (minimal), 2x_week (balanced), 3x_week (active), daily (engaged)';

COMMENT ON COLUMN public.human_design_setups.guilt_sensitivity IS
'User emotional response to plant neglect: yes (feels guilty), somewhat (neutral), no (resilient)';

COMMENT ON COLUMN public.human_design_setups.avatar_personality IS
'Avatar emotional tone: funny (jokes), gentle (encouraging), expert (scientific)';

COMMENT ON COLUMN public.human_design_setups.recommended_check_frequency IS
'Suggested app check-in frequency in days, derived from watering_rhythm';

COMMENT ON COLUMN public.human_design_setups.notification_style IS
'Notification tone: gentle (encouraging), strict (reminder-focused), motivational (gamified)';
