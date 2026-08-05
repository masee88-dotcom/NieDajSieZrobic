import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';

export default function SearchBar({
  value,
  onChangeText,
  onSearch
}) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Dokąd jedziemy?"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onSearch}
      >
        <Text style={styles.buttonText}>Szukaj</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flexDirection:'row',
    backgroundColor:'#fff',
    padding:10,
    elevation:5
  },

  input:{
    flex:1,
    backgroundColor:'#f2f2f2',
    borderRadius:10,
    paddingHorizontal:12,
    marginRight:8
  },

  button:{
    backgroundColor:'#1976D2',
    borderRadius:10,
    justifyContent:'center',
    paddingHorizontal:15
  },

  buttonText:{
    color:'#fff',
    fontWeight:'bold'
  }
});
