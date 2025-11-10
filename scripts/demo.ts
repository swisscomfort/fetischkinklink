// scripts/demo.ts
// Demo: Generates 2 characters and calculates match score

import { CharacterGenerator8D } from '../characterGenerator8D.js';
import { MatchingEngine } from '../matchingEngine.ts';

// ============================================================================
// TEST DATA
// ============================================================================

const USER1_TAGS = [
  // Bondage (MUST)
  { tagId: 'bdsm.bondage.techniques.shibari', tagType: 'must' as const, intensity: 5, category: 'bondage' },
  { tagId: 'bdsm.bondage.materials.rope', tagType: 'must' as const, intensity: 4, category: 'bondage' },
  { tagId: 'bdsm.deprivation.sensory.sight', tagType: 'must' as const, intensity: 3, category: 'sensory' },

  // Submission (MUST)
  { tagId: 'bdsm.domSub.subStyles.pet', tagType: 'must' as const, intensity: 4, category: 'submission' },
  { tagId: 'roleplay.petplay.animals.dog', tagType: 'must' as const, intensity: 4, category: 'roleplay' },

  // Nice-to-haves
  { tagId: 'materials.latex.clothing.catsuit', tagType: 'nice' as const, intensity: 2, category: 'materials' },
  { tagId: 'roleplay.ageplay.abdl.baby', tagType: 'nice' as const, intensity: 2, category: 'roleplay' },
  { tagId: 'psychological.emotions.caregiving', tagType: 'nice' as const, intensity: 3, category: 'psych' },
  { tagId: 'context.frequency.weekends', tagType: 'nice' as const, intensity: 2, category: 'context' },
];

const USER1_LIFESTYLE = {
  housing: 'alone',
  career: 'creative',
  workHours: 'flexible',
  dailyRhythm: 'evening',
  energyLevel: 'moderate',
  diet: 'vegan',
  fitness: 'yoga',
  bodyRelationship: 'body-positive',
  education: 'bachelor',
  intellectualInterests: ['psychology', 'art'],
  mediaConsumption: {
    literature: 'fantasy',
    film: 'indie',
    gaming: 'indie',
    music: 'alternative',
  },
  creativity: ['painting', 'photography'],
  communicationStyle: 'emotional',
  texting: 'long-messages',
  conflictBehavior: 'compromising',
  friendCircle: 'small',
  familyRelationship: 'distant',
  politics: 'liberal',
  spirituality: 'spiritual-not-religious',
  environment: 'conscious',
  wantChildren: 'unsure',
  relationshipStructure: 'monogamous',
  commitment: 'long-term',
  romance: 'romantic',
  jealousy: 'moderate',
  fashionStyle: 'goth',
  bodyModifications: ['tattoos', 'piercings'],
  hairStyle: 'long',
  outStatus: 'fetish-community-only',
  mobility: 'car',
  availability: 'flexible',
};

const USER2_TAGS = [
  // Dominance (MUST)
  { tagId: 'bdsm.domSub.domStyles.caringDomme', tagType: 'must' as const, intensity: 4, category: 'dominance' },
  { tagId: 'roleplay.petplay.animals.dog', tagType: 'must' as const, intensity: 5, category: 'roleplay' },
  { tagId: 'roleplay.petplay.gear.collar', tagType: 'must' as const, intensity: 4, category: 'roleplay' },

  // Caregiving (MUST)
  { tagId: 'psychological.emotions.caregiving', tagType: 'must' as const, intensity: 5, category: 'psych' },
  { tagId: 'roleplay.ageplay.abdl.baby', tagType: 'must' as const, intensity: 3, category: 'roleplay' },

  // Nice-to-haves
  { tagId: 'bdsm.bondage.techniques.shibari', tagType: 'nice' as const, intensity: 3, category: 'bondage' },
  { tagId: 'materials.latex.activities.wearing', tagType: 'nice' as const, intensity: 2, category: 'materials' },
  { tagId: 'context.duration.permanent', tagType: 'nice' as const, intensity: 4, category: 'context' },
  { tagId: 'context.frequency.always', tagType: 'nice' as const, intensity: 3, category: 'context' },
];

const USER2_LIFESTYLE = {
  housing: 'alone',
  career: 'social',
  workHours: 'normal',
  dailyRhythm: 'morning',
  energyLevel: 'high',
  diet: 'vegetarian',
  fitness: 'gym',
  bodyRelationship: 'work-in-progress',
  education: 'bachelor',
  intellectualInterests: ['psychology', 'philosophy'],
  mediaConsumption: {
    literature: 'romance',
    film: 'documentaries',
    gaming: 'none',
    music: 'indie',
  },
  creativity: ['writing'],
  communicationStyle: 'direct',
  texting: 'varies',
  conflictBehavior: 'direct',
  friendCircle: 'large',
  familyRelationship: 'close',
  politics: 'liberal',
  spirituality: 'atheist',
  environment: 'neutral',
  wantChildren: 'want-later',
  relationshipStructure: 'monogamous',
  commitment: 'long-term',
  romance: 'romantic',
  jealousy: 'not-jealous',
  fashionStyle: 'minimal',
  bodyModifications: ['piercings'],
  hairStyle: 'short',
  outStatus: 'family-doesnt-know',
  mobility: 'public-transit',
  availability: 'weekends',
};

// ============================================================================
// DEMO
// ============================================================================

async function runDemo() {
  console.log('🎭 SpiegelMatch - Character Generation & Matching Demo\n');
  console.log('='.repeat(70));

  // Generate Character 1
  console.log('\n👤 Generating Character 1...\n');
  const char1 = CharacterGenerator8D.generate(
    'user-001',
    'PuppyPaws92',
    USER1_TAGS,
    USER1_LIFESTYLE
  );

  console.log(`✨ ${char1.archetype.name}`);
  console.log(`📋 Bio: ${char1.generatedProfile.shortBio}`);
  console.log(`\n📊 Big5 Scores:`);
  console.log(`  • Extraversion:       ${char1.big5.extraversion.toFixed(1)}/100`);
  console.log(`  • Openness:           ${char1.big5.openness.toFixed(1)}/100`);
  console.log(`  • Conscientiousness:  ${char1.big5.conscientiousness.toFixed(1)}/100`);
  console.log(`  • Agreeableness:      ${char1.big5.agreeableness.toFixed(1)}/100`);
  console.log(`  • Neuroticism:        ${char1.big5.neuroticism.toFixed(1)}/100`);

  console.log(`\n🎛️  Adjustments:`);
  console.log(`  • Dominance:  ${char1.adjustments.dominanceLevel.toFixed(0)}/100 (Sub ← | → Dom)`);
  console.log(`  • Intensity:  ${char1.adjustments.intensityLevel.toFixed(0)}/100 (Soft ← | → Hardcore)`);
  console.log(`  • Emotional:  ${char1.adjustments.emotionalDepth.toFixed(0)}/100 (Casual ← | → Intimate)`);
  console.log(`  • Experience: ${char1.adjustments.experience.toFixed(0)}/100 (Newbie ← | → Veteran)`);
  console.log(`  • Publicness: ${char1.adjustments.publicness.toFixed(0)}/100 (Diskret ← | → Out)`);

  console.log(`\n🏷️  Tags: ${char1.tagsSummary.totalTags} total`);
  console.log(`  • MUST-HAVEs: ${char1.tagsSummary.mustHaves.join(', ')}`);
  console.log(`  • NICE-TOs:   ${char1.tagsSummary.niceToHaves.join(', ')}`);

  // Generate Character 2
  console.log('\n' + '='.repeat(70));
  console.log('\n👤 Generating Character 2...\n');
  const char2 = CharacterGenerator8D.generate(
    'user-002',
    'MommyDomme44',
    USER2_TAGS,
    USER2_LIFESTYLE
  );

  console.log(`✨ ${char2.archetype.name}`);
  console.log(`📋 Bio: ${char2.generatedProfile.shortBio}`);
  console.log(`\n📊 Big5 Scores:`);
  console.log(`  • Extraversion:       ${char2.big5.extraversion.toFixed(1)}/100`);
  console.log(`  • Openness:           ${char2.big5.openness.toFixed(1)}/100`);
  console.log(`  • Conscientiousness:  ${char2.big5.conscientiousness.toFixed(1)}/100`);
  console.log(`  • Agreeableness:      ${char2.big5.agreeableness.toFixed(1)}/100`);
  console.log(`  • Neuroticism:        ${char2.big5.neuroticism.toFixed(1)}/100`);

  console.log(`\n🎛️  Adjustments:`);
  console.log(`  • Dominance:  ${char2.adjustments.dominanceLevel.toFixed(0)}/100 (Sub ← | → Dom)`);
  console.log(`  • Intensity:  ${char2.adjustments.intensityLevel.toFixed(0)}/100 (Soft ← | → Hardcore)`);
  console.log(`  • Emotional:  ${char2.adjustments.emotionalDepth.toFixed(0)}/100 (Casual ← | → Intimate)`);
  console.log(`  • Experience: ${char2.adjustments.experience.toFixed(0)}/100 (Newbie ← | → Veteran)`);
  console.log(`  • Publicness: ${char2.adjustments.publicness.toFixed(0)}/100 (Diskret ← | → Out)`);

  console.log(`\n🏷️  Tags: ${char2.tagsSummary.totalTags} total`);
  console.log(`  • MUST-HAVEs: ${char2.tagsSummary.mustHaves.join(', ')}`);
  console.log(`  • NICE-TOs:   ${char2.tagsSummary.niceToHaves.join(', ')}`);

  // Calculate Match
  console.log('\n' + '='.repeat(70));
  console.log('\n💕 Calculating Match Score...\n');

  const matchScore = MatchingEngine.calculateMatch(char1, char2);

  const compatLevel =
    matchScore.overall >= 85
      ? 'Perfect 🎆'
      : matchScore.overall >= 75
        ? 'Excellent 🌟'
        : matchScore.overall >= 65
          ? 'Good 💚'
          : matchScore.overall >= 50
            ? 'Okay 🤝'
            : 'Poor ❌';

  console.log(`📊 MATCH SCORE: ${matchScore.overall}/100 (${compatLevel})\n`);
  console.log(`Breakdown:`);
  matchScore.breakdown.forEach(item => {
    const barLength = 20;
    const filled = Math.round((item.score / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log(
      `  ${item.label.padEnd(20)} [${bar}] ${item.score.toFixed(0)}/100 (${(item.weight * 100).toFixed(0)}% weight)`
    );
  });

  console.log(`\n💬 Recommendation:`);
  if (matchScore.overall >= 75) {
    console.log(
      `   ✅ This is a strong match! ${char1.username} and ${char2.username}`
    );
    console.log(
      `   should definitely connect. They share key interests and`
    );
    console.log(`   have complementary personalities.`);
  } else if (matchScore.overall >= 50) {
    console.log(`   🤔 Possible match with potential. Worth exploring further.`);
  } else {
    console.log(
      `   ❌ Limited compatibility. Better options likely exist for both.`
    );
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Demo complete!\n');
}

// Run
runDemo().catch(console.error);
