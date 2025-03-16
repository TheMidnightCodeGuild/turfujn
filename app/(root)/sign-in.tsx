// import { Alert, SafeAreaView, Text, TouchableOpacity } from "react-native";
// import React from "react";
// import { login } from "@/lib/appwrite";
// import { useGlobalContext } from "@/lib/global-provider";
// import { router } from "expo-router";

// const signIn = () => {
//   const { refetch } = useGlobalContext();
//   const handleSignIn = async () => {
//     const result = await login();
//     if (result) {
//       refetch();
//       // router.replace("/");
//     } else {
//       Alert.alert("Error", "Failed to login");
//     }
//   };
//   return (
//     <SafeAreaView>
//       <Text>Sign In into TurfUjn</Text>
//       <TouchableOpacity onPress={handleSignIn}>
//         <Text>Sign In</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// export default signIn;

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

import { login, loginWithEmailPassword, createAccount } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import icons from "@/constants/icon";
import images from "@/constants/images";
import * as Linking from "expo-linking";

const Auth = () => {
  const { refetch, loading, isLogged } = useGlobalContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleEmailAuth = async () => {
    let result;
    if (isSignUp) {
      result = await createAccount(email, password, name);
    } else {
      result = await loginWithEmailPassword(email, password);
    }

    if (result) {
      refetch();
    } else {
      Alert.alert("Error", `Failed to ${isSignUp ? 'create account' : 'login'}`);
    }
  };

  const handleLogin = async () => {
    try {
      // Get the redirect URI before calling login
      const redirectUri = Linking.createURL("", {
        scheme: "turfujn"
      });
      
      const result = await login();
      if (result) {
        refetch();
      } else {
        Alert.alert(
          "Error", 
          `Failed to login\nRedirect URI: ${redirectUri}\nPlease add this URI to Appwrite OAuth settings`
        );
      }
    } catch (error) {
      Alert.alert(
        "Error Details", 
        `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}\nRedirect URI: ${Linking.createURL("", { scheme: "turfujn" })}`
      );
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <Image
          source={images.onboarding}
          className="w-full h-3/6"
          resizeMode="contain"
        />

        <View className="px-10">
          {/* <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome To TurfUjn
          </Text> */}

          {/* <Text className="text-2xl font-rubik-bold text-black-300 text-center mt-2">
            Find and Book {"\n"}
            <Text className="text-primary-300">Your Perfect Turf</Text>
          </Text> */}

          <View className="mt-8">
            {isSignUp && (
              <TextInput
                className="bg-gray-100 p-4 rounded-lg mb-3"
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
            )}
            
            <TextInput
              className="bg-gray-100 p-4 rounded-lg mb-3"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              className="bg-gray-100 p-4 rounded-lg mb-3"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handleEmailAuth}
              className="bg-primary-300 rounded-lg w-full py-4 mb-3"
            >
              <Text className="text-white text-center font-rubik-medium text-lg">
                {isSignUp ? 'Sign Up' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-center text-primary-300">
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-0.5 bg-gray-200" />
              <Text className="mx-4 text-gray-500">OR</Text>
              <View className="flex-1 h-0.5 bg-gray-200" />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4"
            >
              <View className="flex flex-row items-center justify-center">
                <Image
                  source={icons.google}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Auth;
