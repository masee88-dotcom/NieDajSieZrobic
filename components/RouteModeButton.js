import React from 'react';
import {
  Pressable,
  Text,
  View
} from 'react-native';

export default function RouteModeButton({
  mode,
  onChange
}) {

  const explorer =
    mode === 'explorer';

  return (
    <View
      style={{
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        zIndex: 20,
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 4,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5
      }}
    >

      <Pressable
        onPress={() =>
          onChange('normal')
        }
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 11,
          alignItems: 'center',
          backgroundColor:
            !explorer
              ? '#222'
              : '#fff'
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            color:
              !explorer
                ? '#fff'
                : '#222'
          }}
        >
          🛣️ NORMALNA
        </Text>
      </Pressable>


      <Pressable
        onPress={() =>
          onChange('explorer')
        }
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 11,
          alignItems: 'center',
          backgroundColor:
            explorer
              ? '#222'
              : '#fff'
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            color:
              explorer
                ? '#fff'
                : '#222'
          }}
        >
          🌲 ODKRYWCA
        </Text>
      </Pressable>

    </View>
  );
}
