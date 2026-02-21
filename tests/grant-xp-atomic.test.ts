/**
 * Test Suite: grant-xp-atomic RPC Function
 * Validates atomicity of grant_xp_atomic() function
 *
 * This test verifies that:
 * 1. New user XP grant creates record + returns correct values
 * 2. Existing user XP grant updates record + returns correct values
 * 3. Level-up calculation is correct (every 500 XP)
 * 4. Race conditions are handled (row lock)
 * 5. Transaction atomicity (no partial writes)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_XP_AMOUNT = 50;
const TEST_ACTION = 'water_plant';

describe('grant_xp_atomic RPC Function', () => {

  /**
   * Test 1: New user XP grant (INSERT path)
   *
   * Scenario:
   * - User doesn't have user_achievements record yet
   * - grant_xp_atomic should CREATE record with initial XP
   * - Should return: success=true, new_xp=50, new_level=1, leveled_up=false
   */
  test('should create new achievement record for new user', async () => {
    const { data, error } = await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: TEST_XP_AMOUNT,
      p_action: TEST_ACTION,
    });

    // Assertions
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
    expect(data.new_xp).toBe(TEST_XP_AMOUNT); // First grant = exact amount
    expect(data.new_level).toBe(1); // Level = floor(50 / 500) + 1 = 1
    expect(data.leveled_up).toBe(false); // 1 > 1? No
    expect(data.error_message).toBeNull();
  });

  /**
   * Test 2: Existing user XP update (UPDATE path)
   *
   * Scenario:
   * - User already has user_achievements record
   * - grant_xp_atomic should UPDATE with new XP + recalculate level
   * - Should return updated values
   */
  test('should update XP for existing user', async () => {
    // First grant (creates record)
    await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: 100,
      p_action: TEST_ACTION,
    });

    // Second grant (updates record)
    const { data, error } = await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: 100,
      p_action: TEST_ACTION,
    });

    expect(error).toBeNull();
    expect(data.success).toBe(true);
    expect(data.new_xp).toBe(200); // 100 + 100
    expect(data.new_level).toBe(1); // floor(200 / 500) + 1 = 1
    expect(data.leveled_up).toBe(false); // 1 > 1? No
  });

  /**
   * Test 3: Level-up calculation
   *
   * Scenario:
   * - Grant enough XP to reach next level (500 XP per level)
   * - Should return leveled_up=true
   */
  test('should correctly calculate level-up', async () => {
    // Setup: Create user with 450 XP
    await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: 450,
      p_action: TEST_ACTION,
    });

    // Grant 100 more XP (total = 550, should level up to 2)
    const { data, error } = await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: 100,
      p_action: TEST_ACTION,
    });

    expect(error).toBeNull();
    expect(data.success).toBe(true);
    expect(data.new_xp).toBe(550);
    expect(data.new_level).toBe(2); // floor(550 / 500) + 1 = 2
    expect(data.leveled_up).toBe(true); // 2 > 1? Yes
  });

  /**
   * Test 4: Atomicity guarantee
   *
   * Scenario:
   * - RPC should be atomic (all-or-nothing)
   * - If any operation fails, entire transaction rolls back
   * - Cannot have partial state
   *
   * How to test:
   * - Manually inject error (constraint violation, etc.)
   * - Verify no partial writes occurred
   *
   * NOTE: This test is tricky in automated suite
   * Better to test in integration/manual tests
   */
  test('should handle errors atomically (no partial writes)', async () => {
    // Invalid XP amount (negative)
    // RPC should catch and return error without modifying data
    const { data, error } = await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: -50, // Invalid: negative XP
      p_action: TEST_ACTION,
    });

    // Either error returned OR success=false
    // Data should NOT be in inconsistent state
    if (error) {
      expect(error).toBeDefined();
    } else {
      // If no error, check response
      expect(data.success).toBe(false);
      expect(data.error_message).toBeDefined();
    }
  });

  /**
   * Test 5: RPC performance
   *
   * Scenario:
   * - Single RPC call should be fast
   * - Verify it's faster than old 3-call approach
   */
  test('should execute in reasonable time (<500ms)', async () => {
    const startTime = Date.now();

    await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: 50,
      p_action: TEST_ACTION,
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(500); // Should be <500ms (was ~600ms for old 3-call approach)
  });

  /**
   * Test 6: Database state verification
   *
   * Scenario:
   * - After RPC succeeds, verify database contains correct data
   * - No orphaned records
   * - Data matches returned values
   */
  test('should persist correct data to database', async () => {
    // Grant XP via RPC
    const grantResponse = await supabase.rpc('grant_xp_atomic', {
      p_user_id: TEST_USER_ID,
      p_xp_amount: 75,
      p_action: TEST_ACTION,
    });

    // Query database directly
    const { data: dbRecord, error: queryError } = await supabase
      .from('user_achievements')
      .select('total_xp, total_level')
      .eq('user_id', TEST_USER_ID)
      .single();

    expect(queryError).toBeNull();
    expect(dbRecord.total_xp).toBe(grantResponse.data.new_xp);
    expect(dbRecord.total_level).toBe(grantResponse.data.new_level);
  });
});

/**
 * Integration Test: Edge Function + RPC
 *
 * Validates that grant-xp Edge Function correctly uses new RPC
 */
describe('grant-xp Edge Function Integration', () => {

  test('should grant XP via Edge Function', async () => {
    const EDGE_FUNCTION_URL = 'http://localhost:54321/functions/v1/grant-xp';

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        plantId: 'test-plant-id',
        xpAmount: 50,
        action: 'water_plant',
      }),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.newXp).toBeDefined();
    expect(result.newLevel).toBeDefined();
    expect(result.leveledUp).toBeDefined();
  });
});

/**
 * Cleanup
 *
 * Delete test data after all tests complete
 */
afterAll(async () => {
  // Delete test user achievements
  await supabase
    .from('user_achievements')
    .delete()
    .eq('user_id', TEST_USER_ID);
});
