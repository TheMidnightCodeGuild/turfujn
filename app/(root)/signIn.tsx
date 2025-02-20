import { Alert, SafeAreaView, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { login } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'

    const signIn = () => {
  const { refetch } = useGlobalContext();
  const handleSignIn= async () => {
    const result = await login();
    if (result) {
      refetch();
    } else {
      Alert.alert("Error", "Failed to login");
    }
  };
  return (
    <SafeAreaView>
      <Text>Sign In into TurfUjn</Text>
      <TouchableOpacity onPress={handleSignIn}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default signIn