import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';

export default function BottomTabs({
  activeTab,
  onChangeTab
}) {

  const tabs = [
    { id: 'mapa', label: '🗺️ Mapa' },
    { id: 'trasa', label: '🧭 Trasa' },
    { id: 'moje', label: '⭐ Moje' },
    { id: 'ustawienia', label: '⚙️ Ustawienia' }
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.button}
          onPress={() => onChangeTab(tab.id)}
        >
          <Text
            style={[
              styles.text,
              activeTab === tab.id && styles.active
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flexDirection:'row',
    height:60,
    borderTopWidth:1,
    borderTopColor:'#ddd',
    backgroundColor:'#fff'
  },

  button:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },

  text:{
    color:'#666',
    fontSize:14
  },

  active:{
    color:'#1976D2',
    fontWeight:'bold'
  }

});
