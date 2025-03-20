export interface Team {
  name: string;
  seed: number;
  region: string;
}

export interface Matchup {
  team1: Team;
  team2: Team;
  round: number;
}

export interface SimulationResult {
  winner: Team;
  loser: Team;
  round: number;
}