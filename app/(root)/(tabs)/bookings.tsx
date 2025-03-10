import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUserBookings } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { TIME_SLOTS } from "@/constants/data";

export default function Bookings() {
  const { user, isDarkMode } = useGlobalContext();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: foundUser, loading } = useAppwrite({
    fn: () => getUserBookings(user?.$id!),
    skip: !user,
  });

  const formatSlots = (slots: string[]) => {
    return slots
      .sort()
      .map(slotId => TIME_SLOTS.find(slot => slot.id === slotId)?.label)
      .join('\n');
  };

  const filterBookings = (bookings: any[] = []) => {
    const now = new Date();
    // Reset time to midnight for accurate date comparison
    now.setHours(0, 0, 0, 0);
    
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      // Reset booking time to midnight
      bookingDate.setHours(0, 0, 0, 0);
      
      return activeTab === 'upcoming' 
        ? bookingDate >= now 
        : bookingDate < now;
    });
  };

  const renderBookings = (bookings: any[]) => {
    return bookings.map((booking: any) => (
      <View 
        key={booking.$id} 
        className={`mx-5 my-2 p-4 rounded-xl shadow-sm border ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
        }`}
      >
        <Text className={`text-xl font-rubik-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {booking.turfId?.name || "Unknown Turf"}
        </Text>
        <View className="flex-row items-center mb-3">
          <View className={`h-2 w-2 rounded-full ${activeTab === 'upcoming' ? 'bg-green-500' : 'bg-gray-500'} mr-2`} />
          <Text className={`text-sm font-rubik-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {booking.date ? new Date(booking.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }) : "N/A"}
          </Text>
        </View>
        
        <View className="border-t border-gray-200 pt-3">
          <Text className={`text-xs font-rubik mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Booked Slots
          </Text>
          <Text className={`text-sm font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {booking.slots ? formatSlots(booking.slots) : "N/A"}
          </Text>
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <View className={`px-5 py-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <Text className={`text-3xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          My Bookings
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 py-2">
        <TouchableOpacity 
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 ${activeTab === 'upcoming' ? 'border-b-2 border-primary-300' : ''}`}
        >
          <Text className={`text-center font-rubik-medium ${
            activeTab === 'upcoming' 
              ? isDarkMode ? 'text-primary-300' : 'text-primary-300'
              : isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('past')}
          className={`flex-1 py-2 ${activeTab === 'past' ? 'border-b-2 border-primary-300' : ''}`}
        >
          <Text className={`text-center font-rubik-medium ${
            activeTab === 'past' 
              ? isDarkMode ? 'text-primary-300' : 'text-primary-300'
              : isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0061FF" />
        </View>
      ) : !foundUser?.bookings || foundUser.bookings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className={`text-xl font-rubik-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>
            {activeTab === 'past' ? 'There is no booking' : `You don't have any ${activeTab} bookings`}
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 py-2" 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderBookings(filterBookings(foundUser.bookings))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}