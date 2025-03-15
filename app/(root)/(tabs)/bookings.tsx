import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUserBookings } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { TIME_SLOTS } from "@/constants/data";

// Define booking status type
type BookingStatus = 'Reserved' | 'Confirmed' | 'Cancelled';

// Define status colors with proper typing
const STATUS_COLORS: Record<BookingStatus, {
  bg: string;
  text: string;
  dot: string;
}> = {
  Reserved: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-400"
  },
  Confirmed: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-400"
  },
  Cancelled: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-400"
  }
};

// Define booking type
interface Booking {
  $id: string;
  turfId: {
    name: string;
  };
  date: string;
  slots: string[];
  status: BookingStatus;
}

export default function Bookings() {
  const { user, isDarkMode } = useGlobalContext();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const { data: foundUser, loading, refetch } = useAppwrite({
    fn: () => getUserBookings(user?.$id!),
    skip: !user,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch({}); // Pass empty object as argument
    setRefreshing(false);
  }, [refetch]);

  const formatSlots = (slots: string[]) => {
    return slots
      .sort()
      .map(slotId => TIME_SLOTS.find(slot => slot.id === slotId)?.label)
      .join('\n');
  };

  const filterBookings = (bookings: Booking[] = []) => {
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

  const renderBookings = (bookings: Booking[]) => {
    return bookings.map((booking) => {
      const statusStyle = STATUS_COLORS[booking.status || 'Reserved'];

      return (
        <View 
          key={booking.$id} 
          className={`mx-5 my-2 p-4 rounded-xl shadow-sm border ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
          }`}
        >
          <View className="flex-row justify-between items-start mb-2">
            <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {booking.turfId?.name || "Unknown Turf"}
            </Text>
            
            {/* Status Badge */}
            <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
              <Text className={`text-xs font-rubik-bold ${statusStyle.text}`}>
                {booking.status || 'Reserved'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className={`h-2 w-2 rounded-full ${statusStyle.dot} mr-2`} />
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
      );
    });
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981']} // primary-300 color
              tintColor={isDarkMode ? '#FFFFFF' : '#10B981'}
            />
          }
        >
          {renderBookings(filterBookings(foundUser.bookings))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}