import React from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUserBookings } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

type BookingWithDetails = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  turfName: string;
  turfImage: string | null;
  startTime: string;
  endTime: string;
  status: 'Upcoming' | 'Past' | 'Error';
}

export default function Bookings() {
  const { user } = useGlobalContext();
  const { data: bookings, loading } = useAppwrite({
    fn: () => getUserBookings(user?.$id!),
    skip: !user,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-6 border-b border-gray-100">
        <Text className="text-3xl font-rubik-bold text-black">My Bookings</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0061FF" />
        </View>
      ) : bookings?.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-xl font-rubik-medium text-gray-400 text-center">
            You don't have any bookings yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          contentContainerClassName="py-2"
          renderItem={({ item }) => (
            <View className="mx-5 my-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <Text className="text-xl font-rubik-bold text-black mb-2">
                {item.turfName}
              </Text>
              <View className="flex-row items-center mb-3">
                <View className={`h-2 w-2 rounded-full ${item.status === 'Upcoming' ? 'bg-green-500' : 'bg-gray-500'} mr-2`} />
                <Text className="text-sm font-rubik-medium text-gray-600">
                  {new Date(item.startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
                <View>
                  <Text className="text-xs font-rubik text-gray-500">
                    Start Time
                  </Text>
                  <Text className="text-sm font-rubik-medium text-black">
                    {new Date(item.startTime).toLocaleTimeString()}
                  </Text>
                </View>
                <View className="h-6 w-[1px] bg-gray-200" />
                <View>
                  <Text className="text-xs font-rubik text-gray-500">
                    End Time
                  </Text>
                  <Text className="text-sm font-rubik-medium text-black">
                    {new Date(item.endTime).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.$id}
        />
      )}
    </SafeAreaView>
  );
}