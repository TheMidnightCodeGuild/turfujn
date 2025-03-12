import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  SafeAreaView,
} from "react-native";
import * as Location from "expo-location";
import { useGlobalContext } from "@/lib/global-provider";

// You can expand this list with more Indian cities
const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  // Add more cities as needed
].sort();

export default function LocationPicker({ 
  onLocationSelect 
}: { 
  onLocationSelect: (location: { latitude: number; longitude: number; city: string }) => void 
}) {
  const { isDarkMode } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState(INDIAN_CITIES);

  useEffect(() => {
    // Filter cities based on search query
    const filtered = INDIAN_CITIES.filter(city =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchQuery]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please enable location permissions.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const response = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (response[0]?.city) {
        onLocationSelect({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          city: response[0].city,
        });
      } else {
        Alert.alert("Error", "Could not determine city name.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch location.");
    }
    setLoading(false);
  };

  const handleCitySelect = async (city: string) => {
    try {
      const location = await Location.geocodeAsync(city + ", India");
      if (location[0]) {
        onLocationSelect({
          latitude: location[0].latitude,
          longitude: location[0].longitude,
          city: city,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not get coordinates for selected city.");
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <View className="p-4">
        <TextInput
          className={`border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black'} rounded-lg p-3 mb-4`}
          placeholder="Search cities..."
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          onPress={getCurrentLocation}
          className="bg-primary-300 p-3 rounded-lg mb-4"
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Getting Location..." : "Use Current Location"}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0061FF" />
        ) : (
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCitySelect(item)}
                className={`py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
