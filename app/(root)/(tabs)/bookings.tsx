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
  const { user, isDarkMode } = useGlobalContext();
  const { data: foundUser, loading } = useAppwrite({
    fn: () => getUserBookings(user?.$id!),
    skip: !user,
  });

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black-300' : 'bg-white'}`}>
      {/* Header */}
      <View className={`px-5 py-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <Text className={`text-3xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>My Bookings</Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0061FF" />
        </View>
      ) : !foundUser ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className={`text-xl font-rubik-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>
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
              <View key={booking.$id} className={`mx-5 my-2 p-4 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <Text className={`text-xl font-rubik-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {typeof booking.turfId.name === "string" ? booking.turfId.name : "Unknown Turf"}
                </Text>
                <View className="flex-row items-center mb-3">
                  <View className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  <Text className={`text-sm font-rubik-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {booking.startTime ? new Date(booking.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long", 
                      day: "numeric",
                    }) : "N/A"}
                  </Text>
                </View>
                <View className={`flex-row justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <View>
                    <Text className={`text-xs font-rubik ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Start Time
                    </Text>
                    <Text className={`text-sm font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {booking.startTime ? new Date(booking.startTime).toLocaleTimeString() : "N/A"}
                    </Text>
                  </View>
                  <View className={`h-6 w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <View>
                    <Text className={`text-xs font-rubik ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      End Time  
                    </Text>
                    <Text className={`text-sm font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {booking.endTime ? new Date(booking.endTime).toLocaleTimeString() : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text className={`text-xl font-rubik-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center mt-5`}>
              No bookings found
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}