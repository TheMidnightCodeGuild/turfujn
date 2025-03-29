import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { account, databases, config } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import icons from '@/constants/icon';

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
  const { isDarkMode } = useGlobalContext();

  useEffect(() => {
    fetchUserMatches();
  }, []);

  const fetchUserMatches = async () => {
    try {
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
      const matchDocs = await databases.listDocuments(
        config.databaseId!,
        config.matchesCollectionId!,
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

      await databases.updateDocument(
        config.databaseId!,
        config.matchesCollectionId!,
        matchId,
        teamType === 'my' 
          ? { MyPlayersScore: updatedMatch.MyPlayersScore }
          : { OpPlayersScore: updatedMatch.OpPlayersScore }
      );

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

      await databases.updateDocument(
        config.databaseId!,
        config.matchesCollectionId!,
        matchId,
        teamType === 'my'
          ? { MyPlayersWicket: updatedMatch.MyPlayersWicket }
          : { OpPlayersWickets: updatedMatch.OpPlayersWickets }
      );

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
          className="bg-primary-800 px-3 py-1.5 rounded-full"
          onPress={() => onPress(score)}
        >
          <Text className="text-white text-xs font-rubik-medium">+{score}</Text>
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
    <View className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`text-xl font-rubik-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {teamName}
      </Text>
      {players.map((player, index) => (
        <View key={index} className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <Text className={`font-rubik-bold text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {player || `Player ${index + 1}`}
          </Text>
          <View className="flex-row justify-between items-center mt-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Image source={icons.trophy} className="w-5 h-5 mr-2" tintColor={isDarkMode ? '#fff' : '#000'} />
                <Text className={`font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Score: {scores[index]}
                </Text>
              </View>
              <ScoreButtons onPress={(score) => updateScore(matchId, teamType, index, score)} />
            </View>
            <View className="ml-4">
              <View className="flex-row items-center mb-2">
                <Image source={icons.stumpsProvided} className="w-5 h-5 mr-2" tintColor={isDarkMode ? '#fff' : '#000'} />
                <Text className={`font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Wickets: {wickets[index]}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-primary-800 px-4 py-2 rounded-full"
                onPress={() => updateWicket(matchId, teamType, index)}
              >
                <Text className="text-white font-rubik-medium text-center">+1</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      <ScrollView className="flex-1 px-4">
        <Text className={`text-2xl font-rubik-bold my-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          My Matches
        </Text>

        {matches.map(match => (
          <View key={match.$id} className="mb-4">
            <TouchableOpacity
              className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
              onPress={() => setExpandedMatchId(expandedMatchId === match.$id ? null : match.$id)}
            >
              <View className="flex-row justify-between items-center">
                <Text className={`text-lg font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {match.MatchName}
                </Text>
                <Image 
                  source={icons.rightArrow} 
                  className={`w-5 h-5 ${expandedMatchId === match.$id ? 'rotate-90' : ''}`}
                  tintColor={isDarkMode ? '#fff' : '#000'}
                />
              </View>
              
              {expandedMatchId !== match.$id && (
                <View className="mt-3">
                  <Text className={`font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {match.MyTeamName} vs {match.OpTeamName}
                  </Text>
                  <Text className={`font-rubik mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Score: {match.MyPlayersScore.reduce((a, b) => a + b, 0)} - {match.OpPlayersScore.reduce((a, b) => a + b, 0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

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
            <Text className={`text-lg font-rubik-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No matches found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}