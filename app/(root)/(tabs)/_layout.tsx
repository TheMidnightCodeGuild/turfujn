import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icon";

const TabIcon = ({
  focused,
  icon,
  title,
  isDarkMode,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
  isDarkMode: boolean;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? "green" : isDarkMode ? "white" : "black"}
      resizeMode="contain"
      className="size-7"
    />
    <Text
      className={`${
        focused
          ? `${isDarkMode ? "text-white" : "text-black"} font-rubik-medium`
          : `${isDarkMode ? "text-white" : "text-black"} font-rubik`
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  const { isDarkMode } = useGlobalContext();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#000' : 'white',
          position: "absolute",
          borderTopColor: isDarkMode ? "#333" : "#0061FF1A",
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" isDarkMode={isDarkMode} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Explore" isDarkMode={isDarkMode} />
          ),
        }}
      />
       <Tabs.Screen
        name="tournament"
        options={{
          title: "Tournament",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.trophy} title="Tournament" isDarkMode={isDarkMode} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.booking} title="Bookings" isDarkMode={isDarkMode} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" isDarkMode={isDarkMode} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;