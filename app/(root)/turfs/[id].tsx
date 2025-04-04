import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icon";
import images from "@/constants/images";
import Comment from "@/components/Comment";
import { amenities } from "@/constants/data";

import { useAppwrite } from "@/lib/useAppwrite";
import { getTurfById } from "@/lib/appwrite";
import { BookingModal } from "@/components/BookingModal";
import { useState } from "react";
import { useGlobalContext } from "@/lib/global-provider";

const TurfDetails = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isDarkMode } = useGlobalContext();

  const windowHeight = Dimensions.get("window").height;

  const { data: turf } = useAppwrite({
    fn: (params) => getTurfById(params.id),
    params: {
      id: id!,
    },
  });

  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <View className={isDarkMode ? 'bg-black' : 'bg-white'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName={`pb-32 ${isDarkMode ? 'bg-black' : 'bg-white'}`}
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <Image
            source={{ uri: turf?.image }}
            className="size-full"
            resizeMode="cover"
          />
          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? 70 : 20,
            }}
          >
            <View className="flex flex-row items-center w-full justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-white rounded-full size-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>

              <View className="flex flex-row items-center gap-3">
                <Image
                  source={icons.heart}
                  className="size-7"
                  tintColor={isDarkMode ? "white" : "black"}
                />
                <Image 
                  source={icons.send} 
                  className="size-7"
                  tintColor={isDarkMode ? "white" : "black"}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className={`text-2xl font-rubik-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {turf?.name}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-800">
                {turf?.sports}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="size-5" />
              <Text className={`text-sm mt-1 font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-black-200'}`}>
                {turf?.rating} ({turf?.reviews.length} reviews)
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center mt-5">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <Image source={icons.area} className="size-4" />
            </View>
            <Text className={`text-sm font-rubik-medium ml-2 ${isDarkMode ? 'text-gray-300' : 'text-black-300'}`}>
              {turf?.area} sqft
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.info} className="size-4" />
            </View>
            <Text className={`text-sm font-rubik-medium ml-2 ${isDarkMode ? 'text-gray-300' : 'text-black-300'}`}>
              {turf?.players} Players
            </Text>
          </View>

          <View className="w-full border-t border-primary-200 pt-7 mt-5">
            <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
              Owner
            </Text>

            <View className="flex flex-row items-center justify-between mt-4">
              <View className="flex flex-row items-center">
                <Image
                  source={{ uri: turf?.agent?.avatar }}
                  className="size-14 rounded-full"
                  alt="agent avatar"
                />

                <View className="flex flex-col items-start justify-center ml-3">
                  <Text className={`text-lg text-start font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
                    {turf?.agent?.name}
                  </Text>
                  <Text className={`text-sm text-start font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-black-200'}`}>
                    {turf?.agent?.email}
                  </Text>
                </View>
              </View>

            
            </View>
          </View>

          <View className="mt-7">
            <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
              Overview
            </Text>
            <Text className={`text-base font-rubik mt-2 ${isDarkMode ? 'text-gray-300' : 'text-black-200'}`}>
              {turf?.description}
            </Text>
          </View>

          <View className="mt-7">
            <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
              Amenities
            </Text>

            {turf?.amenities.length > 0 && (
              <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                {turf?.amenities.map((item: string, index: number) => {
                  const amenity = amenities.find(
                    (amenity) => amenity.title === item
                  );

                  let iconSource = icons.info;
                  if (item === "Wifi") iconSource = icons.wifi;
                  else if (item === "Washroom") iconSource = icons.washroom;
                  else if (item === "Changing-Room") iconSource = icons.changingRoom;
                  else if (item === "Free-Parking") iconSource = icons.freeParking;
                  else if (item === "Cricket-Kit") iconSource = icons.cricketKit;
                  else if (item === "Stumps-Provided") iconSource = icons.stumpsProvided;
                  else if (item === "Balls") iconSource = icons.balls;
                  else if (item === "UPI-Accepted") iconSource = icons.upiAccepted;
                  else if (item === "Nets") iconSource = icons.nets;
                  else if (item === "Pet-Friendly") iconSource = icons.dog;
                  else if (item === "Cafe") iconSource = icons.cafe;
                  else if (item === "CCTV") iconSource = icons.cctv;
       

                  return (
                    <View
                      key={index}
                      className="flex flex-1 flex-col items-center min-w-16 max-w-28"
                    >
                      <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                        <Image
                          source={iconSource}
                          className="size-14"
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className={`text-sm text-center font-rubik mt-1.5 ${isDarkMode ? 'text-gray-300' : 'text-black-300'}`}
                      >
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {turf?.gallery.length > 0 && (
            <View className="mt-7">
              <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
                Gallery
              </Text>
              <FlatList
                contentContainerStyle={{ paddingRight: 20 }}
                data={turf?.gallery}
                keyExtractor={(item) => item.$id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.image }}
                    className="size-40 rounded-xl"
                  />
                )}
                contentContainerClassName="flex gap-4 mt-3"
              />
            </View>
          )}

          <View className="mt-7">
            <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
              Location
            </Text>
            <View className="flex flex-row items-center justify-start mt-4 gap-2">
              <Image 
                source={icons.location} 
                className="w-7 h-7"
                tintColor={isDarkMode ? "white" : "black"}
              />
              <Text className={`text-sm font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-black-200'}`}>
                {turf?.address}
              </Text>
            </View>

            <Image
              source={images.map}
              className="h-52 w-full mt-5 rounded-xl"
            />
          </View>

          {turf?.reviews.length > 0 && (
            <View className="mt-7">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center">
                  <Image source={icons.star} className="size-6" />
                  <Text className={`text-xl font-rubik-bold ml-2 ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
                    {turf?.rating} ({turf?.reviews.length} reviews)
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text className="text-primary-300 text-base font-rubik-bold">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mt-5">
                <Comment item={turf?.reviews[0]} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={`absolute bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start">
            <Text className={`text-xs font-rubik-medium ${isDarkMode ? 'text-gray-300' : 'text-black-200'}`}>
              Price per hour
            </Text>
            <Text className="text-primary-300 text-start text-2xl font-rubik-bold">
            ₹{turf?.price}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setShowBookingModal(true)}
            className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400"
          >
            <Text className="text-white text-lg text-center font-rubik-bold">
              Book Now
            </Text>
          </TouchableOpacity>
        </View>

        <BookingModal
          visible={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          turfId={id!}
          turfName={turf?.name || ''}
        />
      </View>
    </View>
  );
};

export default TurfDetails;