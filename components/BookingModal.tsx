import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { checkSlotAvailability, createBooking } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  turfId: string;
  turfName: string;
}

export const BookingModal = ({ visible, onClose, turfId, turfName }: BookingModalProps) => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  
  // Separate states for date and time
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  
  // States to control picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      
      // Update start and end times with the selected date
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
      setStartTime(newStartTime);
      
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(endTime.getHours(), endTime.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newStartTime = new Date(date);
      newStartTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setStartTime(newStartTime);
      
      // Automatically set end time to 1 hour after start time
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newStartTime.getHours() + 1);
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newEndTime = new Date(date);
      newEndTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to book a slot');
      return;
    }

    // Validate times
    if (endTime <= startTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    if (startTime < new Date()) {
      Alert.alert('Error', 'Cannot book slots in the past');
      return;
    }

    try {
      setLoading(true);
      
      const availability = await checkSlotAvailability(turfId, startTime, endTime);
      
      if (!availability.available) {
        Alert.alert('Error', 'This slot is already booked');
        return;
      }

      await createBooking(user.$id, turfId, startTime, endTime);
      
      Alert.alert('Success', 'Slot booked successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to book slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5">
          <Text className="text-2xl font-rubik-bold text-black-300 mb-5">
            Book {turfName}
          </Text>

          {/* Date Selection */}
          <Pressable 
            onPress={() => setShowDatePicker(true)}
            className="mb-5 p-4 border border-primary-200 rounded-lg"
          >
            <Text className="text-base font-rubik-medium mb-1">Select Date</Text>
            <Text className="text-lg text-black-300">
              {date.toLocaleDateString()}
            </Text>
          </Pressable>

          {/* Time Selection */}
          <View className="flex-row gap-4 mb-8">
            <Pressable 
              onPress={() => setShowStartTimePicker(true)}
              className="flex-1 p-4 border border-primary-200 rounded-lg"
            >
              <Text className="text-base font-rubik-medium mb-1">Start Time</Text>
              <Text className="text-lg text-black-300">{formatTime(startTime)}</Text>
            </Pressable>

            <Pressable 
              onPress={() => setShowEndTimePicker(true)}
              className="flex-1 p-4 border border-primary-200 rounded-lg"
            >
              <Text className="text-base font-rubik-medium mb-1">End Time</Text>
              <Text className="text-lg text-black-300">{formatTime(endTime)}</Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 py-4 bg-primary-100 rounded-full"
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
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Pickers */}
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
              minuteInterval={30}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
              minuteInterval={30}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}; 