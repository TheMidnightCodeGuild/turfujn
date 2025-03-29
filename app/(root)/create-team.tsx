import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { account, databases } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { config } from '../../lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';

interface Team {
  name: string;
  players: string[];
}

export default function CreateTeam() {
  const { isDarkMode } = useGlobalContext();
  const [matchName, setMatchName] = useState('');
  const [myTeam, setMyTeam] = useState<Team>({
    name: '',
    players: Array(11).fill('')
  });
  const [opponentTeam, setOpponentTeam] = useState<Team>({
    name: '',
    players: Array(11).fill('')
  });

  const updatePlayerName = (teamType: 'my' | 'opponent', index: number, name: string) => {
    if (teamType === 'my') {
      const newTeam = { ...myTeam };
      newTeam.players[index] = name;
      setMyTeam(newTeam);
    } else {
      const newTeam = { ...opponentTeam };
      newTeam.players[index] = name;
      setOpponentTeam(newTeam);
    }
  };

  const handleSubmit = async () => {
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
      
      const matchData = {
        user: user.$id,
        MatchName: matchName,
        MyTeamName: myTeam.name,
        MyPlayersName: myTeam.players,
        MyPlayersScore: Array(11).fill(0),
        MyPlayersWicket: Array(11).fill(0),
        OpTeamName: opponentTeam.name,
        OpPlayersName: opponentTeam.players,
        OpPlayersScore: Array(11).fill(0),
        OpPlayersWickets: Array(11).fill(0)
      };
      
      await databases.createDocument(
        config.databaseId!,
        config.matchesCollectionId!,
        ID.unique(),
        matchData
      );
      
      router.push('/view-teams');
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match. Please try again.');
    }
  };

  const renderTeamSection = (teamType: 'my' | 'opponent', team: Team, setTeamName: (name: string) => void) => (
    <View className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`text-xl font-rubik-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {teamType === 'my' ? 'My Team' : 'Opponent Team'}
      </Text>
      <TextInput
        className={`border rounded-xl p-3 mb-4 font-rubik ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-gray-50 border-gray-200 text-black'
        }`}
        placeholder="Team Name"
        placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
        value={team.name}
        onChangeText={setTeamName}
      />
      {team.players.map((player, index) => (
        <View key={index} className="mb-3">
          <TextInput
            className={`border rounded-xl p-3 font-rubik ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-gray-50 border-gray-200 text-black'
            }`}
            placeholder={`Player ${index + 1}`}
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            value={player}
            onChangeText={(text) => updatePlayerName(teamType === 'my' ? 'my' : 'opponent', index, text)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      <ScrollView className="flex-1 px-4">
        <Text className={`text-2xl font-rubik-bold my-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Create Match
        </Text>
        
        <TextInput
          className={`border rounded-xl p-3 mb-6 font-rubik ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-black'
          }`}
          placeholder="Match Name"
          placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
          value={matchName}
          onChangeText={setMatchName}
        />

        {renderTeamSection('my', myTeam, (name) => setMyTeam({ ...myTeam, name }))}
        {renderTeamSection('opponent', opponentTeam, (name) => setOpponentTeam({ ...opponentTeam, name }))}

        <TouchableOpacity
          className="bg-primary-800 p-4 rounded-xl mb-6"
          onPress={handleSubmit}
        >
          <Text className="text-white bg-green-500 py-3 text-center font-rubik-bold">Save Match</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}