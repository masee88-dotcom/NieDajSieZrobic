import React from 'react';
import {
TouchableOpacity,
Text,
StyleSheet
} from 'react-native';

export default function MyLocationButton({onPress}){

return(

<TouchableOpacity
style={styles.button}
onPress={onPress}
>

<Text style={styles.text}>

📍

</Text>

</TouchableOpacity>

);

}

const styles=StyleSheet.create({

button:{

position:"absolute",

right:15,

bottom:90,

width:55,

height:55,

borderRadius:30,

backgroundColor:"#1976D2",

justifyContent:"center",

alignItems:"center",

elevation:8

},

text:{

fontSize:26,

color:"#fff"

}

});
