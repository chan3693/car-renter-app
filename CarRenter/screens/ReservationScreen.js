import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { db } from '../config/FirebaseConfig';
import { collection, getDocs,onSnapshot } from 'firebase/firestore';

const ReservationScreen = ({route}) => {

    const {userId} = route.params
    
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const onRefresh = () =>{
        setIsRefreshing(true)
        getAllReservations()
    }

    //auto refersh when doc change in db
    useEffect(() => {
        const collectionRef = collection(db, 'Renter DB', userId, 'Booking');
        try {
            const unsubscribe = onSnapshot(
                collectionRef,
                (querySnapshot) => {
                    const reservationsFromDB = [];
    
                    querySnapshot.forEach((eachDoc) => {
                        const reservation = {
                            id: eachDoc.id,
                            ...eachDoc.data(),
                        };
                        reservationsFromDB.push(reservation);
                    });
    
                    setReservations(reservationsFromDB);
                },
                (error) => {
                    console.log(`Error while fetching reservation: ${error}`);
                }
            );
            return () => unsubscribe();
        } catch (error) {
            console.error(`Error setting up Firestore listener: ${error}`);
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [userId]);

    const getAllReservations = async () => {
        try{
            const collectionRef = collection(db, 'Renter DB', userId, 'Booking')
            const querySnapshot = await getDocs(collectionRef)
            const reservationsFromDB = []
    
            querySnapshot.forEach( (eachDoc) => {
                const reservation = {
                    id: eachDoc.id,
                    ...eachDoc.data()
                }
                reservationsFromDB.push(reservation)
            })
            setReservations(reservationsFromDB)
        }catch(err){
            console.log(`Error while fetching reservation : ${err}`)
        }finally{
            setIsLoading(false)
            setIsRefreshing(false)
        }   
    };

    const renderDataItem = ({item}) => (
        <View style={styles.itemContainer}>

            <Text style={styles.text}>Vehicle Name: {item.vehicleName}</Text>
            <Text style={styles.text}>License Plate: {item.licensePlate}</Text>
            <Image style={styles.imageCar} source={{uri: item.vehiclePhoto}}/>
            <View style={styles.horizontal}> 
                <Image style={styles.image} source={{uri: item.ownerPhoto}}/>                  
                <View>                  
                    <Text style={styles.text}>Owner: </Text>
                    <Text style={styles.text}>{item.ownerName}</Text>
                </View>
            </View>
            <Text style={styles.text}>Booking Date: { item.bookingDate}</Text>
            <Text style={styles.text}>Pickup location: {item.pickupLocation}</Text>
            <Text style={styles.text}>Price: ${item.rentalPrice} / Week</Text>
            <Text style={styles.text}>Booking status: {item.bookingStatus}</Text>
            {
                item.bookingStatus === "Confirmed" ? ( 
                    <Text style={styles.text}>Booking confirmation code : {item.confirmationCode}</Text> 
                ) : null
            }
        </View>

    )

    return (
        <View style={styles.container}>
        {
            isLoading ? (<ActivityIndicator size="large"/>) : 
            (
                <>
                    {
                        reservations.length === 0 ?
                        ( <Text style={styles.msgTitle}>No Reservations found</Text> ) :
                        ( <FlatList
                                data={reservations}
                                keyExtractor={(item) => {return item.id}}
                                renderItem={renderDataItem}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={onRefresh}
                                        />
                                }
                        /> )
                    }
                </>
            )
        }       
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff6f6',
        justifyContent: 'center',
    },
    text:{
        fontSize: 18,
    },
    imageCar: {
        width: 'auto',
        height: 240,
        resizeMode: 'contain',
        marginVertical: 10
    },
    image: {
        width: 80,
        height: 80,
        marginVertical: 8,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 500,
        marginRight: 18,
      },
    itemContainer: {
        borderRadius: 10,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
        marginVertical: 14,
        marginHorizontal: 14,
        backgroundColor: '#fff',
    },
    buttonStyle1: {
        height: 50,
        width: '50%',
        marginHorizontal: 8,
        marginTop: 12,
        padding: 5,
        borderRadius: 10,
        backgroundColor:'green',
        justifyContent:'center',
        alignItems:'center',
    },
    buttonStyle2:{
        height: 50,
        width: '50%',
        marginHorizontal: 8,
        marginTop: 12,
        padding: 5,
        borderRadius: 10,
        backgroundColor:'red',
        justifyContent:'center',
        alignItems:'center',
    },
    buttonTextStyle: {
        fontWeight: 'bold',
        color:'#000',
        fontSize: 20
    },
    horizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent:'space-between',
        width: '100%',
        height: 'auto',
    },
    msgTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'red',
        textAlign: 'center'
      },
});

export default ReservationScreen;