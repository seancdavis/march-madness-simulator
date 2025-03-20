import React, { useState } from 'react';
import { Brackets } from 'lucide-react';
import { teams } from './data/teams2024';
import { simulateRegion, simulateGame, SimulationResult } from './utils/simulator';
import type { Team } from './types/tournament';

function App() {
  const [results, setResults] = useState<{ [key: string]: SimulationResult[] }>({});
  const [finalFour, setFinalFour] = useState<Team[]>([]);
  const [finalFourResults, setFinalFourResults] = useState<SimulationResult[]>([]);
  const [championshipResult, setChampionshipResult] = useState<SimulationResult | null>(null);
  const [champion, setChampion] = useState<Team | null>(null);
  
  const simulateTournament = () => {
    const newResults: { [key: string]: SimulationResult[] } = {
      East: simulateRegion(teams, "East"),
      West: simulateRegion(teams, "West"),
      South: simulateRegion(teams, "South"),
      Midwest: simulateRegion(teams, "Midwest")
    };
    
    // Get Final Four teams (last winner from each region)
    const eastWinner = newResults.East[newResults.East.length - 1].winner;
    const westWinner = newResults.West[newResults.West.length - 1].winner;
    const southWinner = newResults.South[newResults.South.length - 1].winner;
    const midwestWinner = newResults.Midwest[newResults.Midwest.length - 1].winner;
    
    const finalFourTeams = [eastWinner, midwestWinner, southWinner, westWinner];
    
    // Simulate Final Four (East vs Midwest, South vs West)
    const semifinal1Winner = simulateGame(eastWinner, midwestWinner);
    const semifinal1Loser = semifinal1Winner === eastWinner ? midwestWinner : eastWinner;
    const semifinal2Winner = simulateGame(southWinner, westWinner);
    const semifinal2Loser = semifinal2Winner === southWinner ? westWinner : southWinner;
    
    const newFinalFourResults = [
      { winner: semifinal1Winner, loser: semifinal1Loser, round: 5 },
      { winner: semifinal2Winner, loser: semifinal2Loser, round: 5 }
    ];
    
    // Simulate Championship
    const championshipWinner = simulateGame(semifinal1Winner, semifinal2Winner);
    const championshipLoser = championshipWinner === semifinal1Winner ? semifinal2Winner : semifinal1Winner;
    const newChampionshipResult = {
      winner: championshipWinner,
      loser: championshipLoser,
      round: 6
    };
    
    setResults(newResults);
    setFinalFour(finalFourTeams);
    setFinalFourResults(newFinalFourResults);
    setChampionshipResult(newChampionshipResult);
    setChampion(championshipWinner);
  };

  const renderRegionResults = (region: string) => {
    if (!results[region]) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">{region} Region</h3>
        {[1, 2, 3, 4].map(round => (
          <div key={round} className="mb-4">
            <h4 className="font-semibold mb-2">Round {round}</h4>
            {results[region]
              .filter(result => result.round === round)
              .map((result, idx) => (
                <div key={idx} className="text-sm mb-1">
                  <span className="font-medium">{result.winner.name}</span> ({result.winner.seed}) def.{' '}
                  <span className="text-gray-600">{result.loser.name}</span> ({result.loser.seed})
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Brackets className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">March Madness Simulator</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <button
            onClick={simulateTournament}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Simulate Tournament
          </button>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderRegionResults("East")}
              {renderRegionResults("West")}
              {renderRegionResults("South")}
              {renderRegionResults("Midwest")}
            </div>
            
            {finalFour.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Final Four</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finalFourResults.map((result, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">
                          Semifinal {idx + 1}: {idx === 0 ? 'East vs Midwest' : 'South vs West'}
                        </h3>
                        <div className="text-base">
                          <span className="font-medium text-blue-600">{result.winner.name}</span> ({result.winner.seed}) def.{' '}
                          <span className="text-gray-600">{result.loser.name}</span> ({result.loser.seed})
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {championshipResult && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-xl font-bold mb-3 text-center">Championship Game</h3>
                      <div className="text-lg text-center">
                        <span className="font-medium text-blue-600">{championshipResult.winner.name}</span> ({championshipResult.winner.seed}) def.{' '}
                        <span className="text-gray-600">{championshipResult.loser.name}</span> ({championshipResult.loser.seed})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {champion && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-center">National Champion</h2>
                <div className="text-2xl text-center font-bold text-blue-600">
                  {champion.name} ({champion.seed})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
