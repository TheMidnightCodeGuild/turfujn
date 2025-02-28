import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUserBookings } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

export default function Bookings() {
  const { user } = useGlobalContext();
  const { data: foundUser, loading } = useAppwrite({
    fn: () => getUserBookings(user?.$id!),
    skip: !user,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-6 border-b border-gray-100">
        <Text className="text-3xl font-rubik-bold text-black">My Bookings</Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0061FF" />
        </View>
      ) : !foundUser ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-xl font-rubik-medium text-gray-400 text-center">
            You don't have any bookings yet
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 py-2" 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {Array.isArray(foundUser.bookings) && foundUser.bookings.length > 0 ? (
            foundUser.bookings.map((booking: any) => (
              <View key={booking.$id} className="mx-5 my-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Text className="text-xl font-rubik-bold text-black mb-2">
                  {typeof booking.turfId.name === "string" ? booking.turfId.name : "Unknown Turf"}
                </Text>
                <View className="flex-row items-center mb-3">
                  <View className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  <Text className="text-sm font-rubik-medium text-gray-600">
                    {booking.startTime ? new Date(booking.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long", 
                      day: "numeric",
                    }) : "N/A"}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <View>
                    <Text className="text-xs font-rubik text-gray-500">
                      Start Time
                    </Text>
                    <Text className="text-sm font-rubik-medium text-black">
                      {booking.startTime ? new Date(booking.startTime).toLocaleTimeString() : "N/A"}
                    </Text>
                  </View>
                  <View className="h-6 w-[1px] bg-gray-200" />
                  <View>
                    <Text className="text-xs font-rubik text-gray-500">
                      End Time  
                    </Text>
                    <Text className="text-sm font-rubik-medium text-black">
                      {booking.endTime ? new Date(booking.endTime).toLocaleTimeString() : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-xl font-rubik-medium text-gray-400 text-center mt-5">
              No bookings found
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}