import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { account, databases, config } from '../../lib/appwrite';
import { Query } from 'appwrite';

interface Match {
  $id: string;
  user: string;
  MatchName: string;
  MyTeamName: string;
  MyPlayersName: string[];
  MyPlayersScore: number[];
  MyPlayersWicket: number[];
  OpTeamName: string;
  OpPlayersName: string[];
  OpPlayersScore: number[];
  OpPlayersWickets: number[];
}

export default function ViewTeams() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserMatches();
  }, []);

  const fetchUserMatches = async () => {
    try {
      // Get current user
      const currentUser = await account.get();
      const userDocs = await databases.listDocuments(
        config.databaseId!,
        config.usersCollectionId!,
        [Query.equal("userId", currentUser.$id)]
      );

      if (userDocs.documents.length === 0) {
        throw new Error("User not found");
      }

      const user = userDocs.documents[0];
      // Fetch matches for the current user
      const matchDocs = await databases.listDocuments(
        config.databaseId!,
        config.matchesCollectionId!, // Make sure this is defined in your config
        [Query.equal("user", user.$id)]
      );

      setMatches(matchDocs.documents as unknown as Match[]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const updateScore = async (matchId: string, teamType: 'my' | 'opponent', playerIndex: number, scoreToAdd: number) => {
    try {
      const matchToUpdate = matches.find(m => m.$id === matchId);
      if (!matchToUpdate) return;

      const updatedMatch = { ...matchToUpdate };
      if (teamType === 'my') {
        updatedMatch.MyPlayersScore[playerIndex] += scoreToAdd;
      } else {
        updatedMatch.OpPlayersScore[playerIndex] += scoreToAdd;
      }

      // Update in Appwrite database
      await databases.updateDocument(
        config.databaseId!,
        config.matchesCollectionId!,
        matchId,
        teamType === 'my' 
          ? { MyPlayersScore: updatedMatch.MyPlayersScore }
          : { OpPlayersScore: updatedMatch.OpPlayersScore }
      );

      // Update local state
      setMatches(matches.map(m => m.$id === matchId ? updatedMatch : m));
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const updateWicket = async (matchId: string, teamType: 'my' | 'opponent', playerIndex: number) => {
    try {
      const matchToUpdate = matches.find(m => m.$id === matchId);
      if (!matchToUpdate) return;

      const updatedMatch = { ...matchToUpdate };
      if (teamType === 'my') {
        updatedMatch.MyPlayersWicket[playerIndex] += 1;
      } else {
        updatedMatch.OpPlayersWickets[playerIndex] += 1;
      }

      // Update in Appwrite database
      await databases.updateDocument(
        config.databaseId!,
        config.matchesCollectionId!,
        matchId,
        teamType === 'my'
          ? { MyPlayersWicket: updatedMatch.MyPlayersWicket }
          : { OpPlayersWickets: updatedMatch.OpPlayersWickets }
      );

      // Update local state
      setMatches(matches.map(m => m.$id === matchId ? updatedMatch : m));
    } catch (error) {
      console.error('Error updating wickets:', error);
    }
  };

  const ScoreButtons = ({ onPress }: { onPress: (score: number) => void }) => (
    <View className="flex-row flex-wrap gap-1">
      {[1, 2, 3, 4, 5, 6].map((score) => (
        <TouchableOpacity
          key={score}
          className="bg-blue-500 px-2 py-1 rounded"
          onPress={() => onPress(score)}
        >
          <Text className="text-white text-xs">+{score}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTeamSection = (
    matchId: string,
    teamType: 'my' | 'opponent',
    teamName: string,
    players: string[],
    scores: number[],
    wickets: number[]
  ) => (
    <View className="mb-6 p-4 bg-white rounded-lg shadow">
      <Text className="text-xl font-bold mb-4">{teamName}</Text>
      {players.map((player, index) => (
        <View key={index} className="mb-4 p-2 border border-gray-200 rounded">
          <Text className="font-bold">{player || `Player ${index + 1}`}</Text>
          <View className="flex-row justify-between items-center mt-2">
            <View>
              <Text>Score: {scores[index]}</Text>
              <ScoreButtons onPress={(score) => updateScore(matchId, teamType, index, score)} />
            </View>
            <View>
              <Text>Wickets: {wickets[index]}</Text>
              <TouchableOpacity
                className="bg-green-500 px-3 py-1 rounded mt-1"
                onPress={() => updateWicket(matchId, teamType, index)}
              >
                <Text className="text-white">+1</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">My Matches</Text>

      {matches.map(match => (
        <View key={match.$id} className="mb-4">
          <TouchableOpacity
            className="bg-white p-4 rounded-lg shadow"
            onPress={() => setExpandedMatchId(expandedMatchId === match.$id ? null : match.$id)}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold">{match.MatchName}</Text>
              <Text className="text-blue-500">
                {expandedMatchId === match.$id ? '▼' : '▶'}
              </Text>
            </View>
            
            {/* Show summary when collapsed */}
            {expandedMatchId !== match.$id && (
              <View className="mt-2">
                <Text>{match.MyTeamName} vs {match.OpTeamName}</Text>
                <Text className="text-gray-600">
                  Total Score: {match.MyPlayersScore.reduce((a, b) => a + b, 0)} - {match.OpPlayersScore.reduce((a, b) => a + b, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Expanded view */}
          {expandedMatchId === match.$id && (
            <View className="mt-2">
              {renderTeamSection(
                match.$id,
                'my',
                match.MyTeamName,
                match.MyPlayersName,
                match.MyPlayersScore,
                match.MyPlayersWicket
              )}
              {renderTeamSection(
                match.$id,
                'opponent',
                match.OpTeamName,
                match.OpPlayersName,
                match.OpPlayersScore,
                match.OpPlayersWickets
              )}
            </View>
          )}
        </View>
      ))}

      {matches.length === 0 && (
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-gray-500">No matches found</Text>
        </View>
      )}
    </ScrollView>
  );
}