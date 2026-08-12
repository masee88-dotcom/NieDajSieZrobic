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

  return (

    <View
      style={{
        position: 'absolute',

        top: 15,

        left: 10,

        right: 10,

        zIndex: 20,

        flexDirection: 'row',

        backgroundColor: '#ffffff',

        borderRadius: 14,

        padding: 4,

        elevation: 8,

        shadowColor: '#000',

        shadowOpacity: 0.25,

        shadowRadius: 6

      }}
    >


      {/* AUTO */}

      <Pressable

        onPress={() =>
          onChange('auto')
        }

        style={{

          flex: 1,

          paddingVertical: 11,

          borderRadius: 11,

          alignItems: 'center',

          backgroundColor:
            mode === 'auto'
              ? '#222'
              : '#fff'

        }}

      >

        <Text
          style={{

            fontWeight: '800',

            fontSize: 12,

            color:
              mode === 'auto'
                ? '#fff'
                : '#222'

          }}
        >

          🚗 AUTO

        </Text>

      </Pressable>


      {/* MOTOROWER */}

      <Pressable

        onPress={() =>
          onChange('moped')
        }

        style={{

          flex: 1,

          paddingVertical: 11,

          borderRadius: 11,

          alignItems: 'center',

          backgroundColor:
            mode === 'moped'
              ? '#222'
              : '#fff'

        }}

      >

        <Text
          style={{

            fontWeight: '800',

            fontSize: 12,

            color:
              mode === 'moped'
                ? '#fff'
                : '#222'

          }}
        >

          🛵 MOTOROWER

        </Text>

      </Pressable>


      {/* ODKRYWCA */}

      <Pressable

        onPress={() =>
          onChange('explorer')
        }

        style={{

          flex: 1,

          paddingVertical: 11,

          borderRadius: 11,

          alignItems: 'center',

          backgroundColor:
            mode === 'explorer'
              ? '#222'
              : '#fff'

        }}

      >

        <Text
          style={{

            fontWeight: '800',

            fontSize: 12,

            color:
              mode === 'explorer'
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
