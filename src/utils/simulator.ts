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
  
  // First round matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
  const firstRoundPairs = [
    [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15]
  ];
  
  for (const [seed1, seed2] of firstRoundPairs) {
    const team1 = regionTeams.find(t => t.seed === seed1);
    const team2 = regionTeams.find(t => t.seed === seed2);
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
    const roundWinners: Team[] = [];
    
    // Simulate all games in current round
    for (const match of currentRound) {
      const winner = simulateGame(match.team1, match.team2);
      const loser = winner === match.team1 ? match.team2 : match.team1;
      
      results.push({
        winner,
        loser,
        round: roundNumber
      });
      
      roundWinners.push(winner);
    }
    
    // Generate next round matchups
    if (roundWinners.length > 1) {
      if (roundNumber === 1) {
        // Second round matchups (1/16 vs 8/9, 5/12 vs 4/13, 6/11 vs 3/14, 7/10 vs 2/15)
        nextRound.push(
          { team1: roundWinners[0], team2: roundWinners[1], round: roundNumber + 1 },
          { team1: roundWinners[2], team2: roundWinners[3], round: roundNumber + 1 },
          { team1: roundWinners[4], team2: roundWinners[5], round: roundNumber + 1 },
          { team1: roundWinners[6], team2: roundWinners[7], round: roundNumber + 1 }
        );
      } else {
        // Sweet 16 and Elite 8 matchups
        for (let i = 0; i < roundWinners.length; i += 2) {
          nextRound.push({
            team1: roundWinners[i],
            team2: roundWinners[i + 1],
            round: roundNumber + 1
          });
        }
      }
    }
    
    currentRound = nextRound;
    roundNumber++;
  }
  
  return results;
};
