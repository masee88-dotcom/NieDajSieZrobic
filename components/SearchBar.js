import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet
} from 'react-native';

export default function SearchBar({
  onSearch,
  searching
}) {

  const [destination, setDestination] =
    useState('');

  function handleSearch() {

    const value =
      destination.trim();

    if (!value) {
      return;
    }

    onSearch(value);
  }

  return (
    <View style={styles.container}>

      <TextInput
        value={destination}
        onChangeText={setDestination}
        placeholder="Dokąd jedziemy?"
        placeholderTextColor="#777"
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />

      <Pressable
        onPress={handleSearch}
        disabled={searching}
        style={[
          styles.button,
          searching && styles.disabled
        ]}
      >
        <Text style={styles.buttonText}>
          {searching
            ? 'SZUKAM...'
            : 'JEDŹ'}
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    position: 'absolute',
    top: 75,
    left: 15,
    right: 15,
    zIndex: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 5,
    elevation: 7
  },

  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111'
  },

  button: {
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center'
  },

  disabled: {
    opacity: 0.5
  },

  buttonText: {
    color: '#fff',
    fontWeight: '800'
  }

});
