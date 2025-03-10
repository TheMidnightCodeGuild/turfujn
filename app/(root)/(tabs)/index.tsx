import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Keyboard,
  Switch,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icon";

import Search from "@/components/Search";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import { Card, FeaturedCard } from "@/components/Cards";
import LocationPicker from "@/components/LocationPicker";

import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getLatestTurfs, getTurfs } from "@/lib/appwrite";
// import seed from "@/lib/seed";

const Home = () => {
  const { user, isDarkMode, toggleTheme } = useGlobalContext();
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    city: string;
  } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const { data: latestturfs, loading: latestturfsLoading } =
    useAppwrite({
      fn: getLatestTurfs,
    });

  const {
    data: turfs,
    refetch,
    loading,
  } = useAppwrite({
    fn: getTurfs,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => router.push(`/turfs/${id}`);

  const handleLocationSelect = (location: { latitude: number; longitude: number; city: string }) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  return (
    <SafeAreaView className={`h-full ${isDarkMode ? 'bg-black-300' : 'bg-white'}`}>
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <LocationPicker onLocationSelect={handleLocationSelect} />
      </Modal>

      <FlatList
        data={turfs}
        numColumns={2}
        renderItem={({ item }) => (
          <Card item={item} onPress={() => handleCardPress(item.$id)} />
        )}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        ListHeaderComponent={() => (
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <View className="flex flex-row items-center">
                {/* <Image
                  source={{ uri: user?.avatar }}
                  className="size-12 rounded-full"
                /> */}

                <TouchableOpacity 
                  onPress={() => setShowLocationPicker(true)}
                  className="flex flex-row items-center ml-2"
                >
                  <Image source={icons.location} className="size-10 mr-1" />
                  <Text className={`text-base font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
                    {selectedLocation ? selectedLocation.city : "Select Location"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex flex-row items-center gap-4">
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
                <Image source={icons.bell} className="size-6" />
              </View>
            </View>

            <Search />

            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
                  Featured
                </Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-primary-300">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {latestturfsLoading ? (
                <ActivityIndicator size="large" className="text-primary-300" />
              ) : !latestturfs || latestturfs.length === 0 ? (
                <NoResults />
              ) : (
                <FlatList
                  data={latestturfs}
                  renderItem={({ item }) => (
                    <FeaturedCard
                      item={item}
                      onPress={() => handleCardPress(item.$id)}
                    />
                  )}
                  keyExtractor={(item) => item.$id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="flex gap-5 mt-5"
                />
              )}
            </View>

            {/* <Button title="seed" onPress={seed} /> */}

            <View className="mt-5">
              <View className="flex flex-row items-center justify-between">
                <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
                  Our Recommendation
                </Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-primary-300">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              <Filters />
            </View>
          </View>
        )}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        onScrollBeginDrag={Keyboard.dismiss}
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
};

export default Home;
