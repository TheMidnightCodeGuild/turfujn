import { Stack } from "expo-router";
import "@/app/globals.css";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { GlobalProvider, useGlobalContext } from "@/lib/global-provider";
import * as SplashScreen from "expo-splash-screen";

const AppContainer = () => {
  const { isDarkMode } = useGlobalContext();
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"), 
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: isDarkMode ? '#000' : '#fff'
        }
      }} 
    />
  );
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <AppContainer />
    </GlobalProvider>
  );
}
