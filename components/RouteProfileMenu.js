import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import {
  ROUTE_PROFILES
} from '../utils/routeProfiles';

export default function RouteProfileMenu({
  activeProfile,
  onSelect,
  onClose
}) {

  return (
    <View style={styles.overlay}>

      <View style={styles.panel}>

        <View style={styles.header}>

          <Text style={styles.title}>
            🏍️ Rodzaj trasy
          </Text>

          <TouchableOpacity
            onPress={onClose}
          >
            <Text style={styles.close}>
              ✕
            </Text>
          </TouchableOpacity>

        </View>

        {Object.values(ROUTE_PROFILES).map(
          profile => (

            <TouchableOpacity
              key={profile.id}
              style={[
                styles.option,
                activeProfile === profile.id &&
                  styles.active
              ]}
              onPress={() => {
                onSelect(profile.id);
                onClose();
              }}
            >

              <Text style={styles.icon}>
                {profile.icon}
              </Text>

              <View style={styles.textArea}>

                <Text style={styles.name}>
                  {profile.name}
                </Text>

                <Text style={styles.description}>

                  {profile.id === 'motorower'
                    ? 'Do 45 km/h • bez autostrad'
                    : profile.id === 'cross'
                    ? 'Drogi lokalne • tryb terenowy'
                    : profile.id === 'motocykl'
                    ? 'Normalna nawigacja motocyklowa'
                    : 'Normalna nawigacja samochodowa'}

                </Text>

              </View>

              {activeProfile === profile.id && (

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
    zIndex: 100
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

  active: {
    backgroundColor: '#e3f2fd'
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
    color: '#1976D2',
    fontWeight: 'bold'
  }

});
