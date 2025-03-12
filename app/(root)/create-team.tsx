import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { account, databases } from '../../lib/appwrite'; // Add databases import
import { ID, Query } from 'appwrite'; // Add ID import for document creation
import { config } from '../../lib/appwrite';
interface Team {
  name: string;
  players: string[];
}

export default function CreateTeam() {
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
      console.log("Found user ID:", user.$id);
      
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
      
      // Save to Appwrite database
      await databases.createDocument(
        config.databaseId!,
        config.matchesCollectionId!,
        ID.unique(),
        matchData
      );
      
      router.push('/view-teams');
    } catch (error) {
      console.error('Error saving match:', error);
      // Optionally add some user feedback here
      alert('Failed to save match. Please try again.');
    }
  };

  const renderTeamSection = (teamType: 'my' | 'opponent', team: Team, setTeamName: (name: string) => void) => (
    <View className="mb-6 p-4 bg-white rounded-lg shadow">
      <Text className="text-xl font-bold mb-4">
        {teamType === 'my' ? 'My Team' : 'Opponent Team'}
      </Text>
      <TextInput
        className="border border-gray-300 rounded-md p-2 mb-4"
        placeholder="Team Name"
        value={team.name}
        onChangeText={setTeamName}
      />
      {team.players.map((player, index) => (
        <View key={index} className="mb-2">
          <TextInput
            className="border border-gray-300 rounded-md p-2"
            placeholder={`Player ${index + 1}`}
            value={player}
            onChangeText={(text) => updatePlayerName(teamType === 'my' ? 'my' : 'opponent', index, text)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Create Match</Text>
      
      <TextInput
        className="border border-gray-300 rounded-md p-2 mb-6"
        placeholder="Match Name"
        value={matchName}
        onChangeText={setMatchName}
      />

      {renderTeamSection('my', myTeam, (name) => setMyTeam({ ...myTeam, name }))}
      {renderTeamSection('opponent', opponentTeam, (name) => setOpponentTeam({ ...opponentTeam, name }))}

      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-md"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-bold">Save Match</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}