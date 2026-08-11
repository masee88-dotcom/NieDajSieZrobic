import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';

export default function ExplorerButton({
  mode,
  onPress
}) {

  const active = mode !== 'normal';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        active && styles.active
      ]}
      onPress={onPress}
    >

      <Text style={styles.icon}>
        {active ? '🌲' : '🧭'}
      </Text>

      <Text style={styles.text}>
        {active ? 'Odkrywca' : 'Odkrywaj'}
      </Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  button: {
    position: 'absolute',
    left: 12,
    top: 135,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6
  },

  active: {
    backgroundColor: '#dcedc8'
  },

  icon: {
    fontSize: 19,
    marginRight: 6
  },

  text: {
    fontSize: 13,
    fontWeight: 'bold'
  }

});
