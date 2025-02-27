import React from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { useAppwrite } from '@/lib/useAppwrite';
import { getUserBookings } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';

export default function Bookings() {
  const { user } = useGlobalContext();
  const { data: bookings, loading } = useAppwrite({
    fn: () => getUserBookings(user?.$id!),
    skip: !user,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-4">
        <Text className="text-2xl font-rubik-bold text-black-300">My Bookings</Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <View className="px-5 py-3 border-b border-primary-100">
            <Text className="text-lg font-rubik-bold">{item.turfName}</Text>
            <Text className="text-sm font-rubik-medium text-black-200">
              {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
            </Text>
            {/* <Text className="text-sm font-rubik text-primary-300 mt-1">
              Status: {item.status}
            </Text> */}
          </View>
        )}
        keyExtractor={item => item.$id}
      />
    </SafeAreaView>
  );
} 