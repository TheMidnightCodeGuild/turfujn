import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, Pressable, ScrollView, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { checkSlotAvailability, createBooking } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { TIME_SLOTS } from '@/constants/data';
import { BlurView } from 'expo-blur';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  turfId: string;
  turfName: string;
}

export const BookingModal = ({ visible, onClose, turfId, turfName }: BookingModalProps) => {
  const { user, isDarkMode } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [name, setName] = useState<string>(user?.name || '');

  useEffect(() => {
    if (date) {
      checkAvailability();
    }
  }, [date]);

  const checkAvailability = async () => {
    try {
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const result = await checkSlotAvailability(turfId, checkDate, TIME_SLOTS.map(slot => slot.id));
      setUnavailableSlots(result.unavailableSlots);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
      setDate(newDate);
      setSelectedSlots([]); // Reset selected slots when date changes
    }
  };

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      } else {
        return [...prev, slotId].sort();
      }
    });
  };

  const isSlotDisabled = (slot: typeof TIME_SLOTS[0]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // If selected date is today, disable past slots
    if (selectedDate.getTime() === today.getTime()) {
      if (slot.start <= now.getHours()) {
        return true;
      }
    }
    
    return unavailableSlots.includes(slot.id);
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to book a slot');
      return;
    }

    if (selectedSlots.length === 0) {
      Alert.alert('Error', 'Please select at least one slot');
      return;
    }

    try {
      setLoading(true);
      // Create a new UTC date at midnight
      const bookingDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
      
      await createBooking(user.$id, turfId, bookingDate, selectedSlots, name);
      Alert.alert('Success', 'Slot(s) booked successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to book slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <View className="flex-1 justify-end">
          <View className={`rounded-t-3xl p-5 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
            <Text className={`text-2xl font-rubik-bold mb-5 ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
              Book {turfName}
            </Text>

            {/* Date Selection */}
            <Pressable 
              onPress={() => setShowDatePicker(true)}
              className={`mb-5 p-4 border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-primary-200'}`}
            >
              <Text className={`text-base font-rubik-medium mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>Select Date</Text>
              <Text className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-black-300'}`}>
                {date.toLocaleDateString()}
              </Text>
            </Pressable>

            {/* Time Slots */}
            <ScrollView className="max-h-[300px] mb-5">
              <View className="flex-row flex-wrap gap-2">
                {TIME_SLOTS.map(slot => {
                  const isSelected = selectedSlots.includes(slot.id);
                  const isDisabled = isSlotDisabled(slot);

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => !isDisabled && toggleSlot(slot.id)}
                      className={`p-3 rounded-lg border ${
                        isSelected 
                          ? 'bg-primary-300 border-primary-300' 
                          : isDisabled
                            ? `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`
                            : `${isDarkMode ? 'border-gray-700' : 'border-primary-200'}`
                      }`}
                      disabled={isDisabled}
                    >
                      <Text className={`text-sm ${
                        isSelected 
                          ? 'text-white font-rubik-bold'
                          : isDisabled
                            ? 'text-gray-400'
                            : isDarkMode ? 'text-gray-300' : 'text-black-300'
                      }`}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={onClose}
                className={`flex-1 py-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-primary-100'}`}
              >
                <Text className="text-center font-rubik-bold text-primary-300">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleBooking}
                disabled={loading}
                className="flex-1 py-4 bg-primary-300 rounded-full"
              >
                <Text className="text-center font-rubik-bold text-white">
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
              >
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                  <View className="flex-1 justify-end">
                    <View className={`${isDarkMode ? 'bg-black' : 'bg-white'} p-4`}>
                      <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text className="text-primary-300 font-rubik-medium">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text className="text-primary-300 font-rubik-medium">Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                        textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                      />
                    </View>
                  </View>
                </BlurView>
              </Modal>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};