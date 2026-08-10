import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList
} from 'react-native';

export default function SearchBar({
  results,
  onSearch,
  onSelect
}) {

  const [text, setText] = useState('');

  const search = () => {
    onSearch(text);
  };

  return (
    <View style={styles.wrapper}>

      <View style={styles.searchRow}>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Dokąd jedziemy?"
          placeholderTextColor="#777"
          returnKeyType="search"
          onSubmitEditing={search}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={search}
        >
          <Text style={styles.buttonText}>🔍</Text>
        </TouchableOpacity>

      </View>

      {results.length > 0 && (

        <View style={styles.results}>

          <FlatList
            keyboardShouldPersistTaps="handled"
            data={results}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (

              <TouchableOpacity
                style={styles.result}
                onPress={() => {
                  setText(item.name);
                  onSelect(item);
                }}
              >

                <Text
                  style={styles.resultText}
                  numberOfLines={2}
                >
                  📍 {item.name}
                </Text>

              </TouchableOpacity>

            )}
          />

        </View>

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    position: 'absolute',
    top: 12,
    left: 10,
    right: 10,
    zIndex: 20
  },

  searchRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden'
  },

  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222'
  },

  button: {
    width: 58,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976D2'
  },

  buttonText: {
    fontSize: 22
  },

  results: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 240,
    elevation: 6
  },

  result: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },

  resultText: {
    fontSize: 14,
    color: '#222'
  }

});
