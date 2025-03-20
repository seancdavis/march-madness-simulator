// Historical upset probabilities based on seed matchups
const UPSET_PROBABILITIES: { [key: string]: number } = {
  "1-16": 0.01,  // Only happened once in history
  "2-15": 0.06,
  "3-14": 0.13,
  "4-13": 0.21,
  "5-12": 0.35,  // Famous 5-12 upset special
  "6-11": 0.37,
  "7-10": 0.40,
  "8-9": 0.50,   // Nearly even matchup
};

// Get upset probability for a matchup
const getUpsetProbability = (higherSeed: number, lowerSeed: number): number => {
  const key = `${higherSeed}-${lowerSeed}`;
  return UPSET_PROBABILITIES[key] || 0.3; // Default to 30% for other matchups
};

// Simulate a single game between two teams
export const simulateGame = (team1: Team, team2: Team): Team => {
  const [higherSeed, lowerSeed] = team1.seed < team2.seed ? [team1, team2] : [team2, team1];
  const upsetProbability = getUpsetProbability(higherSeed.seed, lowerSeed.seed);
  
  // Add some randomness based on seed difference
  const seedDifference = Math.abs(team1.seed - team2.seed);
  const randomFactor = Math.random() * (1 + seedDifference / 32);
  
  return randomFactor < upsetProbability ? lowerSeed : higherSeed;
};

// Generate first round matchups for a region
export const generateFirstRound = (teams: Team[], region: string): Matchup[] => {
  const regionTeams = teams.filter(team => team.region === region);
  const matchups: Matchup[] = [];
  
  // Standard NCAA tournament seeding pairs (1v16, 2v15, etc)
  for (let i = 1; i <= 8; i++) {
    const team1 = regionTeams.find(t => t.seed === i);
    const team2 = regionTeams.find(t => t.seed === 17 - i);
    if (team1 && team2) {
      matchups.push({ team1, team2, round: 1 });
    }
  }
  
  return matchups;
};

// Simulate an entire region
export const simulateRegion = (teams: Team[], region: string): SimulationResult[] => {
  const results: SimulationResult[] = [];
  let currentRound = generateFirstRound(teams, region);
  let roundNumber = 1;

  while (currentRound.length > 0) {
    const nextRound: Matchup[] = [];
    
    for (let i = 0; i < currentRound.length; i += 2) {
      const match1 = currentRound[i];
      const winner1 = simulateGame(match1.team1, match1.team2);
      const loser1 = winner1 === match1.team1 ? match1.team2 : match1.team1;
      
      results.push({
        winner: winner1,
        loser: loser1,
        round: roundNumber
      });

      if (i + 1 < currentRound.length) {
        const match2 = currentRound[i + 1];
        const winner2 = simulateGame(match2.team1, match2.team2);
        const loser2 = winner2 === match2.team1 ? match2.team2 : match2.team1;
        
        results.push({
          winner: winner2,
          loser: loser2,
          round: roundNumber
        });

        nextRound.push({
          team1: winner1,
          team2: winner2,
          round: roundNumber + 1
        });
      }
    }
    
    currentRound = nextRound;
    roundNumber++;
  }
  
  return results;
};