import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInput, View, Image, Keyboard, TouchableOpacity } from 'react-native';
import icons from '@/constants/icon';
import { useGlobalContext } from '@/lib/global-provider';

const Search = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const [searchText, setSearchText] = useState(params.query || '');
  const { isDarkMode } = useGlobalContext();

  const handleSearch = () => {
    Keyboard.dismiss();
    
    // When submitting, if empty show all results
    const currentParams = { ...params };
    if (searchText.trim()) {
      currentParams.query = searchText.trim();
    } else {
      delete currentParams.query;
    }
    router.setParams(currentParams);
  };

  const handleChangeText = (text: string) => {
    setSearchText(text);
    // Don't do anything else - just update the input value
  };

  const handleClear = () => {
    setSearchText('');
    // Don't dismiss keyboard or update params - just clear the input
  };

  return (
    <View className={`flex-row items-center rounded-xl mt-5 px-4 py-2 ${isDarkMode ? 'bg-black' : 'bg-white-200'}`}>
      <Image 
        source={icons.search} 
        className="size-6" 
        tintColor={isDarkMode ? "#fff" : "#191D31"}
      />
      <TextInput
        placeholder="Search address, or near you"
        value={searchText}
        onChangeText={handleChangeText}
        className={`flex-1 ml-2 font-rubik text-base ${isDarkMode ? 'text-white placeholder:text-white/50' : 'text-black-300 placeholder:text-black-300/50'}`}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(25,29,49,0.5)"}
      />
      {searchText ? (
        <TouchableOpacity onPress={handleClear}>
          <Image 
            source={icons.backArrow} 
            className="size-5"
            tintColor={isDarkMode ? "#fff" : "#191D31"}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default Search;
