import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export default function SearchBar({ onSearch }) {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Dokąd jedziemy?"
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSearch(text)}
      >
        <Text style={styles.buttonText}>Szukaj</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 8,
    height: 45,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
