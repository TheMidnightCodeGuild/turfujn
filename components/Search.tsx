import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInput, View, Image, Keyboard, TouchableOpacity } from 'react-native';
import icons from '@/constants/icon';

const Search = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const [searchText, setSearchText] = useState(params.query || '');

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
    <View className="flex-row items-center bg-white-200 rounded-xl mt-5 px-4 py-2">
      <Image source={icons.search} className="size-6" />
      <TextInput
        placeholder="Search address, or near you"
        value={searchText}
        onChangeText={handleChangeText}
        className="flex-1 ml-2 font-rubik text-base text-black-300"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      {searchText ? (
        <TouchableOpacity onPress={handleClear}>
          <Image 
            source={icons.backArrow} 
            className="size-5"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default Search;
