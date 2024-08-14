import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";

import { auth } from "../config/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

import { db } from "../config/FirebaseConfig";
import { doc, getDoc} from 'firebase/firestore';

const SigninScreen = ( {navigation} ) => {
    const [emailAddress, setEmailAddress] = useState('renter@gmail.com');
    const [password, setPassword] = useState('renter123');

    const checkUser = async (docId) =>{
        try {
            const docRef = doc(db, "Renter DB", docId)
            const querySnapshot = await getDoc(docRef)

            if (querySnapshot.exists()){
                console.log("User found in Car Owner DB")
                return true
            }else{
                console.log("User not found in Car Owner DB")
                return false
            }
        }catch (err) {
            console.log(`Error while checking user in DB : ${err}`)
            return false
        }
    }   

    const onSignInClicked = async () => {
        console.log(`sign in clicked`);

        if (!emailAddress || !password){
            console.log("empty email and password")
            Alert.alert("Please input email and password")
            return
        }

        try{
            const userCredentials = await signInWithEmailAndPassword(auth, emailAddress, password)
            const userId = userCredentials.user.uid
            console.log(`userCredentials id : ${userId}`)
            console.log(`userCredentials email : ${userCredentials.user.email}`)

            const userInDb = await checkUser(userId)

            if (userInDb) {
                navigation.navigate("SearchScreen", {userId})
                console.log(`Signed In successfully`)
            }else{
                console.log("User is not authorized to access")
            }
        }catch(err){
            console.log(`Error while signing in : ${err}`)
            Alert.alert("Invalid email or password", "Invalid email or password")
        }

    }

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Sign In your account</Text>
            <TextInput 
                style={styles.inputStyle}
                placeholder="Enter Username"
                textContentType="emailAddress"
                autoCapitalize="none"
                returnKeyType="next"
                value={emailAddress}
                onChangeText={setEmailAddress}
            />

            <TextInput 
                style={styles.inputStyle}
                placeholder="Enter Password"
                textContentType="password"
                autoCapitalize="none"
                returnKeyType="done"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <Pressable style={styles.buttonStyle} onPress={onSignInClicked}>
                <Text style={styles.buttonTextStyle}>Sign In</Text>
            </Pressable>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        padding: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        margin: 12,
        textAlign: 'center'
    },
    inputStyle : {
        height: 50,
        margin: 10,
        padding: 5,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 20
    },
    buttonStyle: {
        height: 50,
        margin: 10,
        padding: 5,
        borderRadius: 5,
        backgroundColor:'#089cf5',
        justifyContent:'center',
        alignItems:'center',
    },
    buttonTextStyle: {
        fontWeight: 'bold',
        color:'#000',
        fontSize: 20
    }
});

export default SigninScreen;