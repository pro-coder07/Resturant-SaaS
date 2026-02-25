import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({override: true});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Supabase Diagnostic Test');
console.log('================================');
console.log(`URL: ${supabaseUrl}`);
console.log(`Anon Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING'}`);
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ MISSING SUPABASE CREDENTIALS');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  try {
    // Test 1: Check if restaurants table exists and has data
    console.log('Test 1: Check restaurants table...');
    const { data: restaurants, error: restaurantsError, status: restaurantsStatus } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);
    
    console.log(`  Status: ${restaurantsStatus}`);
    if (restaurantsError) {
      console.log(`  ❌ Error: ${restaurantsError.message}`);
      console.log(`  Code: ${restaurantsError.code}`);
    } else {
      console.log(`  ✓ Found ${restaurants ? restaurants.length : 0} restaurants`);
      if (restaurants && restaurants.length > 0) {
        console.log(`  Sample: ${restaurants[0].name}`);
      }
    }
    console.log('');

    // Test 2: Check if tables table exists and is accessible
    console.log('Test 2: Check tables table...');
    const { data: tablesData, error: tablesError, status: tablesStatus } = await supabase
      .from('tables')
      .select('id, table_number, capacity')
      .limit(1);
    
    console.log(`  Status: ${tablesStatus}`);
    if (tablesError) {
      console.log(`  ❌ Error: ${tablesError.message}`);
      console.log(`  Code: ${tablesError.code}`);
      console.log(`  Details: ${JSON.stringify(tablesError.details)}`);
    } else {
      console.log(`  ✓ Tables table accessible`);
      console.log(`  ✓ Found ${tablesData ? tablesData.length : 0} tables`);
    }
    console.log('');

    // Test CRITICAL: Try to insert a table and see actual error
    console.log('Test CRITICAL: Attempting INSERT into tables...');
    
    // First get a restaurant ID
    const { data: firstRestaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1)
      .single();
    
    if (restError || !firstRestaurant) {
      console.log(`  ⚠ No restaurant found to use for testing`);
      console.log(`  Error: ${restError?.message || 'Unknown'}`);
    } else {
      const restaurantId = firstRestaurant.id;
      console.log(`  Using restaurant: ${restaurantId}`);
      
      const testTable = {
        restaurant_id: restaurantId,
        table_number: 9999,
        capacity: 4,
        location: 'test-location',
        status: 'available'
      };
      
      console.log(`  Inserting: ${JSON.stringify(testTable)}`);
      
      const { data: insertedTable, error: insertError, status: insertStatus } = await supabase
        .from('tables')
        .insert([testTable])
        .select()
        .single();
      
      console.log(`  Response Status: ${insertStatus}`);
      if (insertError) {
        console.log(`  ❌ INSERT FAILED`);
        console.log(`     Message: ${insertError.message}`);
        console.log(`     Code: ${insertError.code}`);
        console.log(`     Hint: ${insertError.hint}`);
        console.log(`     Details: ${JSON.stringify(insertError.details)}`);
      } else {
        console.log(`  ✅ INSERT SUCCESSFUL`);
        console.log(`     Table ID: ${insertedTable.id}`);
        console.log(`     Table #: ${insertedTable.table_number}`);
      }
    }
    console.log('');

  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
    console.log(error);
  }
}

runTests();
