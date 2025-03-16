import {
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';

import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

import icons from "@/constants/icon";
import { settings } from "@/constants/data";
import { router } from "expo-router";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => {
  const { isDarkMode } = useGlobalContext();
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-row items-center justify-between py-3"
    >
      <View className="flex flex-row items-center gap-3">
        <Image source={icon} className="size-6" tintColor={isDarkMode ? 'white' : '#1A1A1A'} />
        <Text className={`text-lg font-rubik-medium ${isDarkMode ? 'text-white' : 'text-black-300'} ${textStyle}`}>
          {title}
        </Text>
      </View>

      {showArrow && <Image source={icons.rightArrow} className="size-5" tintColor={isDarkMode ? 'white' : '#1A1A1A'} />}
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { user, refetch, isDarkMode } = useGlobalContext();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Here you would typically upload the image to your backend
      // and update the user's avatar URL
      Alert.alert('Success', 'Profile photo updated!');
      refetch();
    }
  };

  return (
    <SafeAreaView className={`h-full ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-between mt-5">
          <Text className={`text-xl font-rubik-bold ${isDarkMode ? 'text-white' : 'text-black-300'}`}>Profile</Text>
          <Image source={icons.bell} className="size-5" tintColor={isDarkMode ? 'white' : '#1A1A1A'} />
        </View>

        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image
              source={{ uri: user?.avatar }}
              className="size-44 relative rounded-full"
            />
            <TouchableOpacity className="absolute bottom-11 right-2" onPress={pickImage}>
              <Image source={icons.edit} className="size-9" tintColor={isDarkMode ? 'white' : '#1A1A1A'} />
            </TouchableOpacity>

            <Text className={`text-2xl font-rubik-bold mt-2 ${isDarkMode ? 'text-white' : 'text-black-300'}`}>{user?.name}</Text>
          </View>
        </View>

        <View className="flex flex-col mt-10">
          <SettingsItem icon={icons.calendar} title="My Bookings" />
          <SettingsItem icon={icons.wallet} title="Payments" />
          <SettingsItem icon={icons.person} title="Create Teams" onPress={() => router.push('/create-team')}/>
          <SettingsItem icon={icons.person} title="View Teams" onPress={() => router.push('/view-teams')}/>
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          {/* {settings.slice(2).map((item, index) => (
            <SettingsItem key={index} {...item} />
          ))}  */}
             <SettingsItem icon={icons.person} title="Profile" onPress={() => router.push('/UpdateProfile')}/>
             <SettingsItem icon={icons.bell} title="Notifications"/>
             <SettingsItem icon={icons.people} title="Invite friends"/>
             
        </View>

        <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;