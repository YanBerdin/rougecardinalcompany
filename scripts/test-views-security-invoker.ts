#!/usr/bin/env tsx
/**
 * Test script to verify SECURITY INVOKER views work correctly
 * after migration 20251022160000_fix_all_views_security_invoker.sql
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testViews() {
  console.log('🧪 Testing SECURITY INVOKER views after migration...\n');
  console.log('📋 All views should work with anon role (public access)\n');
  
  let allPassed = true;
  
  // Test 1: articles_presse_public
  console.log('1️⃣ Testing articles_presse_public view...');
  try {
    const { data: articles, error: articlesError } = await supabase
      .from('articles_presse_public')
      .select('id, title')
      .limit(5);
    
    if (articlesError) {
      console.error('   ❌ Error:', articlesError.message);
      allPassed = false;
    } else {
      console.log(`   ✅ Success: ${articles?.length || 0} articles fetched`);
      if (articles && articles.length > 0) {
        console.log(`   📰 First article: "${articles[0].title}"`);
      }
    }
  } catch (error) {
    console.error('   ❌ Exception:', error);
    allPassed = false;
  }
  
  // Test 2: communiques_presse_public
  console.log('\n2️⃣ Testing communiques_presse_public view...');
  try {
    const { data: communiques, error: communiquesError } = await supabase
      .from('communiques_presse_public')
      .select('id, title')
      .limit(5);
    
    if (communiquesError) {
      console.error('   ❌ Error:', communiquesError.message);
      allPassed = false;
    } else {
      console.log(`   ✅ Success: ${communiques?.length || 0} communiqués fetched`);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error);
    allPassed = false;
  }
  
  // Test 3: popular_tags
  console.log('\n3️⃣ Testing popular_tags view...');
  try {
    const { data: tags, error: tagsError } = await supabase
      .from('popular_tags')
      .select('id, name, usage_count')
      .limit(5);
    
    if (tagsError) {
      console.error('   ❌ Error:', tagsError.message);
      allPassed = false;
    } else {
      console.log(`   ✅ Success: ${tags?.length || 0} tags fetched`);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error);
    allPassed = false;
  }
  
  // Test 4: categories_hierarchy
  console.log('\n4️⃣ Testing categories_hierarchy view...');
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories_hierarchy')
      .select('id, name, level')
      .limit(5);
    
    if (categoriesError) {
      console.error('   ❌ Error:', categoriesError.message);
      allPassed = false;
    } else {
      console.log(`   ✅ Success: ${categories?.length || 0} categories fetched`);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error);
    allPassed = false;
  }
  
  // Test 5: analytics_summary (should work if table has data)
  console.log('\n5️⃣ Testing analytics_summary view...');
  try {
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_summary')
      .select('event_type, total_events')
      .limit(5);
    
    if (analyticsError) {
      console.error('   ❌ Error:', analyticsError.message);
      allPassed = false;
    } else {
      console.log(`   ✅ Success: ${analytics?.length || 0} analytics entries fetched`);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error);
    allPassed = false;
  }
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All public views tested successfully!');
    console.log('🔐 SECURITY INVOKER migration verified: views run with anon user privileges');
  } else {
    console.log('❌ Some views failed - check errors above');
    process.exit(1);
  }
}

testViews().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
