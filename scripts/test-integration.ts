#!/usr/bin/env tsx
/**
 * Test-Script für SpiegelMatch Backend + Supabase Integration
 * Testet: Character Generation, Database Persistence, Matching
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🧪 SpiegelMatch Integration Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Check Environment Variables
console.log('📋 Test 1: Environment Check');
const hasSupabaseUrl = !!process.env.SUPABASE_URL;
const hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;
console.log(`   SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
console.log(`   SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅' : '❌'}`);
console.log();

if (!hasSupabaseUrl || !hasSupabaseKey) {
  console.log('❌ Fehlende Environment Variables. Test abgebrochen.\n');
  process.exit(1);
}

// Test 2: Character Generation
console.log('📋 Test 2: Character Generation (API Call)');
try {
  const testData = {
    userId: 'test-user-' + Date.now(),
    username: 'TestCharacter',
    tags: [
      { tagId: 'T001', tagName: 'Bondage', tagType: 'must' },
      { tagId: 'T002', tagName: 'Roleplay', tagType: 'nice' }
    ],
    lifestyle: {
      relationshipStyle: 'monogamous',
      experienceLevel: 'experienced',
      communicationStyle: 'direct'
    }
  };

  const response = await fetch('http://localhost:3001/api/character/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  
  if (result.success && result.data) {
    console.log('   ✅ Character erfolgreich generiert');
    console.log(`   📊 Archetype: ${result.data.archetype.name}`);
    console.log(`   🎯 Big5: O=${result.data.big5.openness}, C=${result.data.big5.conscientiousness}`);
    console.log(`   🏷️  Tags: ${result.data.tags.length} gesamt`);
  } else {
    throw new Error('Invalid response structure');
  }
} catch (error) {
  console.log('   ❌ Fehler:', error instanceof Error ? error.message : error);
}
console.log();

// Test 3: Database Connection
console.log('📋 Test 3: Supabase Database Connection');
try {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data, error, count } = await supabase
    .from('characters')
    .select('*', { count: 'exact', head: false })
    .limit(1);

  if (error) {
    throw error;
  }

  console.log('   ✅ Verbindung erfolgreich');
  console.log(`   📦 Characters in DB: ${count ?? 0}`);
} catch (error) {
  console.log('   ❌ Fehler:', error instanceof Error ? error.message : error);
}
console.log();

// Test 4: Taxonomy Endpoint
console.log('📋 Test 4: Taxonomy API');
try {
  const response = await fetch('http://localhost:3001/api/taxonomy');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  
  if (result.success && result.data) {
    const categories = Object.keys(result.data);
    console.log('   ✅ Taxonomy geladen');
    console.log(`   📚 Kategorien: ${categories.length}`);
    console.log(`   🏷️  Erste Kategorie: ${categories[0]}`);
  }
} catch (error) {
  console.log('   ❌ Fehler:', error instanceof Error ? error.message : error);
}
console.log();

// Test 5: Health Check
console.log('📋 Test 5: Health Endpoint');
try {
  const response = await fetch('http://localhost:3001/api/health');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  console.log('   ✅ Health Check erfolgreich');
  console.log(`   🏥 Status: ${result.status}`);
  console.log(`   📊 DB Connected: ${result.database?.connected ? '✅' : '❌'}`);
} catch (error) {
  console.log('   ❌ Fehler:', error instanceof Error ? error.message : error);
}
console.log();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Integration Tests abgeschlossen\n');
