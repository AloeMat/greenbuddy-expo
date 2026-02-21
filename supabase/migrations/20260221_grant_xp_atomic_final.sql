-- Force drop and create the function
DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS grant_xp_atomic(uuid, integer, text) CASCADE;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE FUNCTION grant_xp_atomic(
  p_user_id uuid,
  p_xp_amount integer,
  p_action text
)
RETURNS TABLE (
  success boolean,
  new_xp integer,
  new_level integer,
  leveled_up boolean,
  error_message text
) AS $$
DECLARE
  v_current_xp integer := 0;
  v_current_level integer := 1;
  v_new_xp integer;
  v_new_level integer;
  v_leveled_up boolean := false;
BEGIN
  SELECT total_xp, total_level INTO v_current_xp, v_current_level
  FROM user_achievements
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO user_achievements (user_id, is_premium, total_xp, total_level, created_at, updated_at)
    VALUES (p_user_id, false, p_xp_amount, 1, NOW(), NOW())
    RETURNING total_xp, total_level INTO v_new_xp, v_new_level;

    RETURN QUERY SELECT true, v_new_xp, v_new_level, false, NULL::text;
    RETURN;
  END IF;

  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := FLOOR(v_new_xp / 500)::integer + 1;
  v_leveled_up := v_new_level > v_current_level;

  UPDATE user_achievements
  SET total_xp = v_new_xp, total_level = v_new_level, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, v_new_xp, v_new_level, v_leveled_up, NULL::text;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, NULL::integer, NULL::integer, false, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION grant_xp_atomic(uuid, integer, text) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION grant_xp_atomic(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_xp_atomic(uuid, integer, text) TO anon;
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
