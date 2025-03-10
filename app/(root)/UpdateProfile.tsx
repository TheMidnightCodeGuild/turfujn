import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import icons from '@/constants/icon';

interface User {
  name?: string;
  username?: string;
  bio?: string;
  dob?: string;
  email?: string;
  phone?: string;
  preferredSport?: string[];
  avatar?: string;
}

const SPORTS = [
  "Football",
  "Badminton", 
  "Cricket", 
  "Basketball",
  "Tennis"
];

const UpdateProfile = () => {
  const { user, refetch, isDarkMode } = useGlobalContext();
  const [name, setName] = useState((user as User)?.name || '');
  const [username, setUsername] = useState((user as User)?.username || '');
  const [bio, setBio] = useState((user as User)?.bio || '');
  const [dob, setDob] = useState((user as User)?.dob || '');
  const [email, setEmail] = useState((user as User)?.email || '');
  const [phone, setPhone] = useState((user as User)?.phone || '');
  const [selectedSports, setSelectedSports] = useState<string[]>((user as User)?.preferredSport || []);
  const [loading, setLoading] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !username.trim() || !dob.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // await updateUser({ name, username, bio, dob, email, phone, preferredSport: selectedSports });
      await refetch();
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sport)) {
        return prev.filter(s => s !== sport);
      } else {
        return [...prev, sport];
      }
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-7 pb-32"
      >
        <View className="flex-row items-center justify-between mt-5">
          <TouchableOpacity 
            onPress={() => router.back()}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-2 rounded-full`}
          >
            <Image source={icons.backArrow} className="size-6" tintColor={isDarkMode ? 'white' : '#1A1A1A'} />
          </TouchableOpacity>
          <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Edit Profile</Text>
          <View className="size-6" />
        </View>

        <View className="items-center mt-10">
          <View className="relative">
            <Image
              source={{ uri: (user as User)?.avatar }}
              className="size-44 rounded-full border-4 border-primary-200"
            />
            <TouchableOpacity className="absolute bottom-2 right-2 bg-primary p-2 rounded-full">
              <Image source={icons.edit} className="size-6 tint-white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-10 space-y-6">
          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#666' : undefined}
              className={`border border-primary-200 rounded-xl p-4 text-base font-rubik ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor={isDarkMode ? '#666' : undefined}
              className={`border border-primary-200 rounded-xl p-4 text-base font-rubik ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Write something about yourself"
              placeholderTextColor={isDarkMode ? '#666' : undefined}
              multiline
              className={`border border-primary-200 rounded-xl p-4 text-base font-rubik h-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Date of Birth
            </Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDarkMode ? '#666' : undefined}
              keyboardType="numeric"
              className={`border border-primary-200 rounded-xl p-4 text-base font-rubik ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={isDarkMode ? '#666' : undefined}
              keyboardType="email-address"
              className={`border border-primary-200 rounded-xl p-4 text-base font-rubik ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Phone Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={isDarkMode ? '#666' : undefined}
              keyboardType="phone-pad"
              className={`border border-primary-200 rounded-xl p-4 text-base font-rubik ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} mb-2`}>
              Preferred Sports
            </Text>
            <TouchableOpacity
              onPress={() => setShowSportPicker(true)}
              className={`border border-primary-200 rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <Text className={`text-base font-rubik ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {selectedSports.length > 0 
                  ? selectedSports.join(', ')
                  : 'Select sports'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={loading}
          className={`mt-10 bg-primary rounded-xl p-4 ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white text-center font-rubik-medium text-lg">
            {loading ? 'Updating...' : 'Update Profile'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showSportPicker}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className={`rounded-3xl p-5 w-[90%] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <View className="flex-row justify-between items-center mb-5">
                <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Select Sports</Text>
                <TouchableOpacity onPress={() => setShowSportPicker(false)}>
                  <Text className="text-primary-300 font-rubik-medium">Done</Text>
                </TouchableOpacity>
              </View>
              
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  onPress={() => toggleSport(sport)}
                  className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex-row justify-between items-center ${
                    selectedSports.includes(sport) ? 'bg-primary-100' : ''
                  }`}
                >
                  <Text className={`text-lg font-rubik ${
                    selectedSports.includes(sport) ? 'text-primary-300' : isDarkMode ? 'text-white' : 'text-black-300'
                  }`}>
                    {sport}
                  </Text>
                  {selectedSports.includes(sport) && (
                    <View className="size-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-sm">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProfile;
