import {
  computeStudentMatch,
  normalizeSkill,
  MATCH_WEIGHTS,
  CandidateUser,
  TargetUserContext,
} from '../matchingEngine';

export function runMatchingEngineTests() {
  console.log('🧪 Running Matching Engine Unit Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. Alias Handling
  assert(normalizeSkill('k8s') === 'Kubernetes', 'Alias: k8s -> Kubernetes');
  assert(normalizeSkill('ML Ops') === 'MLOps', 'Alias: ML Ops -> MLOps');
  assert(normalizeSkill('docker') === 'Docker', 'Alias: docker -> Docker');
  assert(normalizeSkill('fastapi') === 'FastAPI', 'Alias: fastapi -> FastAPI');
  assert(normalizeSkill('postgres') === 'PostgreSQL', 'Alias: postgres -> PostgreSQL');

  // 2. Weights Verification
  const weightSum =
    MATCH_WEIGHTS.SKILLS +
    MATCH_WEIGHTS.PROJECTS +
    MATCH_WEIGHTS.CAREER_GOAL +
    MATCH_WEIGHTS.INTERESTS;
  assert(Math.abs(weightSum - 1.0) < 0.0001, 'Weights sum exactly to 1.0 (100%)');
  assert(MATCH_WEIGHTS.SKILLS === 0.7, 'Skills weight is exactly 70%');
  assert(MATCH_WEIGHTS.PROJECTS === 0.15, 'Projects weight is exactly 15%');
  assert(MATCH_WEIGHTS.CAREER_GOAL === 0.1, 'Career Goal weight is exactly 10%');
  assert(MATCH_WEIGHTS.INTERESTS === 0.05, 'Interests weight is exactly 5%');

  // 3. Full Match Scenario
  const targetUser: TargetUserContext = {
    userId: 'usr_target_1',
    targetSkills: ['Docker', 'Kubernetes', 'FastAPI'],
    careerGoal: 'Machine Learning Engineer',
    preferredField: 'AI & Machine Learning',
    interests: ['Distributed Systems', 'Generative AI'],
  };

  const perfectCandidate: CandidateUser = {
    id: 'usr_cand_1',
    name: 'Aarav Sharma',
    college: 'IIT Bombay',
    course: 'B.Tech',
    currentYear: 4,
    careerGoal: 'Machine Learning Engineer',
    preferredField: 'AI & Machine Learning',
    technicalSkills: ['Docker', 'Kubernetes', 'FastAPI', 'PyTorch'],
    interests: ['Distributed Systems', 'Generative AI'],
    projects: [
      { name: 'K8s Cluster', technologies: ['Docker', 'Kubernetes', 'FastAPI'] }
    ],
    courses: [
      { name: 'Docker & K8s', skills: ['Docker', 'Kubernetes'] }
    ],
    availableToHelp: true,
    studyBuddyEnabled: true,
    profileVisibility: 'public',
  };

  const fullMatchResult = computeStudentMatch(targetUser, perfectCandidate);
  assert(fullMatchResult !== null, 'Candidate matched');
  assert(fullMatchResult!.matchedSkills.length === 3, 'Matched all 3 target skills');
  assert(fullMatchResult!.scoreBreakdown.skillsScore === 100, 'Skills score is 100%');
  assert(fullMatchResult!.matchPercentage >= 95, 'High overall match percentage >= 95%');
  assert(fullMatchResult!.roleCategory === 'Experienced Learner', 'Classified as Experienced Learner');

  // 4. Zero Match Scenario
  const zeroCandidate: CandidateUser = {
    id: 'usr_cand_zero',
    name: 'Unrelated Learner',
    college: 'Arts College',
    course: 'B.A.',
    currentYear: 1,
    careerGoal: 'Graphic Designer',
    technicalSkills: ['Photoshop', 'Illustrator'],
    interests: ['Typography'],
    projects: [],
    courses: [],
    availableToHelp: false,
    studyBuddyEnabled: true,
    profileVisibility: 'public',
  };

  const zeroMatchResult = computeStudentMatch(targetUser, zeroCandidate);
  assert(zeroMatchResult !== null, 'Candidate evaluated');
  assert(zeroMatchResult!.matchedSkills.length === 0, 'Zero matched skills');
  assert(zeroMatchResult!.scoreBreakdown.skillsScore === 0, 'Skills score is 0%');
  assert(zeroMatchResult!.roleCategory === 'Study Buddy', 'Classified as Study Buddy when studyBuddyEnabled');

  // 5. Self Exclusion
  const selfMatch = computeStudentMatch(targetUser, {
    ...perfectCandidate,
    id: 'usr_target_1', // same as target
  });
  assert(selfMatch === null, 'Target user is excluded from matching self');

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  return { passed, failed };
}

// Execute if run directly via tsx
if (require.main === module) {
  runMatchingEngineTests();
}
