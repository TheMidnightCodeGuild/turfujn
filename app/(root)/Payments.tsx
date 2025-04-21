import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';

const Payments = () => {
  const { isDarkMode } = useGlobalContext();

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      <View className="flex-1 items-center justify-center px-4">
        <View className={`w-full p-6 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <Text className={`text-2xl font-rubik-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Payments
          </Text>
          <Text className={`text-center font-rubik ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Coming Soon! Payment functionality will be available in future updates.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Payments;
