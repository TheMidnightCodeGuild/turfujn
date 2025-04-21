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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleEmailAuth = async () => {
    setIsAuthenticating(true);
    try {
      let result;
      if (isSignUp) {
        result = await createAccount(email, password, name);
      } else {
        result = await loginWithEmailPassword(email, password);
      }

      if (result) {
        refetch();
        return <Redirect href="/" />;
      } else {
        Alert.alert("Error", `Failed to ${isSignUp ? 'create account' : 'login'}`);
      }
    } catch (error) {
      Alert.alert("Error", `An error occurred while ${isSignUp ? 'signing up' : 'logging in'}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const redirectUri = Linking.createURL("/");
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
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView className="bg-gray-100 flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center">
            <Image
              source={images.onboarding}
              className="w-full h-[70%]"
              resizeMode="contain"
            />

            <View className="px-6 flex-1 justify-center mb-28">
              <View className="w-full">
                {isSignUp && (
                  <TextInput
                    className="bg-gray-100 px-4 py-3 rounded-lg mb-3 border"
                    placeholder="Full Name"
                    placeholderTextColor="#6b7280"
                    value={name}
                    onChangeText={setName}
                    editable={!isAuthenticating}
                  />
                )}
                
                <TextInput
                  className="bg-gray-100 px-4 py-3 rounded-lg mb-3 border"
                  placeholder="Email"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isAuthenticating}
                />
                
                <TextInput
                  className="bg-gray-100 px-4 py-3 rounded-lg mb-4 border"
                  placeholder="Password"
                  placeholderTextColor="#6b7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isAuthenticating}
                />

                <TouchableOpacity
                  onPress={handleEmailAuth}
                  className={`bg-primary-300 rounded-lg w-full py-4 mb-3 ${isAuthenticating ? 'opacity-70' : ''}`}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-rubik-medium text-lg">
                      {isSignUp ? 'Sign Up' : 'Login'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={isAuthenticating}>
                  <Text className={`text-center text-primary-300 ${isAuthenticating ? 'opacity-70' : ''}`}>
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Auth;
