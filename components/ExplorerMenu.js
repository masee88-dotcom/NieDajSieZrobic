import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import {
  EXPLORER_MODES
} from '../utils/explorerMode';

export default function ExplorerMenu({
  activeMode,
  onSelect,
  onClose
}) {

  return (
    <View style={styles.overlay}>

      <View style={styles.panel}>

        <View style={styles.header}>

          <Text style={styles.title}>
            🌲 Tryb jazdy
          </Text>

          <TouchableOpacity
            onPress={onClose}
          >

            <Text style={styles.close}>
              ✕
            </Text>

          </TouchableOpacity>

        </View>


        {Object.values(EXPLORER_MODES).map(
          item => (

            <TouchableOpacity
              key={item.id}
              style={[
                styles.option,
                activeMode === item.id &&
                  styles.selected
              ]}
              onPress={() => {

                onSelect(item.id);
                onClose();

              }}
            >

              <Text style={styles.icon}>
                {item.icon}
              </Text>

              <View style={styles.textArea}>

                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.description}>
                  {item.description}
                </Text>

              </View>

              {activeMode === item.id && (

                <Text style={styles.check}>
                  ✓
                </Text>

              )}

            </TouchableOpacity>

          )
        )}

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 200
  },

  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 30
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  close: {
    fontSize: 24,
    color: '#555'
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
    backgroundColor: '#f5f5f5'
  },

  selected: {
    backgroundColor: '#dcedc8'
  },

  icon: {
    fontSize: 28,
    width: 45
  },

  textArea: {
    flex: 1
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  description: {
    marginTop: 3,
    color: '#666',
    fontSize: 12
  },

  check: {
    fontSize: 24,
    color: '#388e3c',
    fontWeight: 'bold'
  }

});
