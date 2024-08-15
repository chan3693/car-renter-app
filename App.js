import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Pressable, View, Text} from 'react-native';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { auth } from './config/FirebaseConfig';
import { signOut } from 'firebase/auth';
import SigninScreen from './screens/SigninScreen';
import SearchScreen from './screens/SearchScreen';
import ReservationScreen from './screens/ReservationScreen'

const Stack = createNativeStackNavigator();

export default function App() {

  //function perform logout
  const performLogout = async(navigation) => {
    try{
      await signOut(auth)

      console.log(`Successfully signed out`);

      if (navigation.canGoBack()){
        navigation.dispatch(StackActions.popToTop())
      }

    }catch(err){
      console.log(`Error while signing out : ${err}`);
    }
  }

  const headerOptions = ({ navigation }) => ({
    headerRight: () => (
      <Pressable onPress={() => {
        performLogout(navigation)
      }}>
        <Icon name="exit" size={35} color="black" />
      </Pressable>
    )
  })

  return (
    // <HomeScreen />
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName='Car Renter App G08'
        screenOptions={()=>({
          headerStyle: {backgroundColor: '#089cf5'},
          headerTintColor: '#000',
          headerTinteStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        })}
      >
        <Stack.Screen name='Car Renter App G08' component={SigninScreen} />
        <Stack.Group screenOptions={headerOptions}> 
          <Stack.Screen name='SearchScreen' component={SearchScreen} />
          <Stack.Screen name='ReservationScreen' component={ReservationScreen}/>
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
