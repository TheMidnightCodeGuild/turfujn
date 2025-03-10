import { SafeAreaView, Text, View, Image } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icon";

const Tournament = () => {
  const { isDarkMode } = useGlobalContext();

  return (
    <SafeAreaView className={`h-full ${isDarkMode ? 'bg-black-300' : 'bg-white'}`}>
      <View className="flex-1 items-center justify-center">
        <Image 
          source={icons.trophy}
          className="size-32 mb-8"
          tintColor={isDarkMode ? "#fff" : "#191D31"}
        />
        <Text className={`text-2xl font-rubik-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
          Stay Tuned
        </Text>
        <Text className={`text-5xl font-rubik-bold uppercase mb-4 ${isDarkMode ? 'text-white' : 'text-black-300'}`}>
          Coming Soon
        </Text>
        <Text className={`text-base font-rubik text-center px-8 ${isDarkMode ? 'text-white/70' : 'text-black-300/70'}`}>
          We're working hard to bring you exciting tournaments. Check back soon for updates!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Tournament;