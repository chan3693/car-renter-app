import { useEffect, useRef, useState } from "react"
import { Alert, StyleSheet, View, TouchableOpacity, Text } from "react-native"
import MapView, { Marker } from "react-native-maps"

//import the expo-location package and as alias it as Location
import * as Location from "expo-location"
import { collection, getDoc, getDocs, query, addDoc, updateDoc, doc,onSnapshot } from "firebase/firestore"
import { where } from "firebase/firestore/lite"
import { db } from "../config/FirebaseConfig"
import RentalSummary from "./RentalSummary"

const SearchScreen = ({ route, navigation }) => {

    const { userId } = route.params
    const [rentalList, setRentalList] = useState([])
    const [currentCity, setCurrentCity] = useState()

    let defaultLocation = { coords: { latitude: 43.663082, longitude: -79.401874 } }
    let defaultRegion = { latitude: 43.663082, longitude: -79.401874, latitudeDelta: 1, longitudeDelta: 1 }

    const [currentLocation, setCurrentLocation] = useState(defaultLocation)

    //create a reference for the map
    const mapRef = useRef(null)

    // summary
    const [selectedRental, setSelectedRental] = useState(null);
    const [summaryVisible, setSummaryVisible] = useState(false);

    //function to request location permission
    const requestLocationPermission = async () => {
        try {
            //obtain the instance of Forground Location permission from the expo-location module
            const permissionObject = await Location.requestForegroundPermissionsAsync()

            if (permissionObject.status === 'granted') {
                console.log(`location permission granted`);
                getCurrLocation()
            } else {
                console.log(`location permission denied`);
            }

        } catch (err) {
            console.log(`Error while requesting location permission: ${err}`);
        }
    }

    useEffect(() => {
        requestLocationPermission()
    }, [])

    //function to access user's device location
    const getCurrLocation = async () => {
        try {
            // getCurrentPositionAsync() will fetch the current location of device 
            // for the specified accuracy
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })

            if (location !== undefined) {
                console.log(`Current location : ${JSON.stringify(location)}`);

                setCurrentLocation(location)
                //show the location on map

                //create a region to represent the location
                const mapRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                }

                if (mapRef !== null) {
                    //move the map to show the region
                    mapRef.current.animateToRegion(mapRegion, 1000)
                } else {
                    console.log(`MapView is null. Cannot show the location on map`);
                }

                // 

                const city = await getCityName(location.coords)
                setCurrentCity(city)
                getRentalList(city)


            } else {
                console.log(`Could not obtain the current device location`);
                alert(`Could not obtain the current device location!`)
            }
        } catch (error) {
            console.log(`Error while accessing device location : ${error}`);
        }
    }

    //function to obtain street address for given coordinates
    const getCityName = async (coords) => {
        try {
            console.log(`coordinates: ${JSON.stringify(coords)}`);
            //reverseGeocodeAsync() takes location coordinates object as a parameter and
            // returns array of any matching postal addresses
            const postalAddressList = await Location.reverseGeocodeAsync(coords, {})
            console.log(`postalAddressList : ${JSON.stringify(postalAddressList)}`);

            if (postalAddressList !== undefined) {
                //process the first postal address
                const result = postalAddressList[0]

                if (result !== undefined) {
                    console.log(`doReverseGeocode result.city : ${result.city}`);
                    return result.city
                } else {
                    console.log(`doReverseGeocode No address found for given coordinates`);
                }
            } else {
                console.log(`doReverseGeocode No address found for given coordinates`);
            }

        } catch (error) {
            console.log(`Error while performing reverse geocoding error: ${error}`);
        }
    }

const getRentalList = async (city) => { 
    try {
        const collectionRef = collection(db, 'Car Owner DB');

        // Fetch all car owner documents
        const carOwnersSnapshot = await getDocs(collectionRef);
        const ownerList = [];

        carOwnersSnapshot.forEach((eachOwner) => {
            const owners = {
                id: eachOwner.id,
                ...eachOwner.data()
            };
            ownerList.push(owners);
        });
        console.log(`Number of owners: ${ownerList.length}`);

        // Initialize allListings to an empty array
        let allListings = [];

        ownerList.forEach((carOwnerDoc) => {
            const { id: ownerId, ownerName, ownerPhoto } = carOwnerDoc;
            const listingRef = collection(db, 'Car Owner DB', carOwnerDoc.id, 'Listing');

            const cityQuery = query(listingRef, where("city", '==', city));
            
            // Listen for changes in rental listings
            onSnapshot(cityQuery, (rentalListingsSnapshot) => {
                const updatedListings = []; 

                rentalListingsSnapshot.forEach((rentalDoc) => {
                    const rental = {
                        carId: rentalDoc.id,
                        ...rentalDoc.data(),
                        ownerId: ownerId,
                        ownerName: ownerName,
                        ownerPhoto: ownerPhoto
                    };
                    if (rental.carStatus === "Available" || rental.carStatus === "Pending") {
                        updatedListings.push(rental); 
                    }
                });

                
                allListings = allListings 
                    .filter(listing => listing.ownerId !== ownerId) 
                    .concat(updatedListings); 
                

                console.log(`Number of listings for owner ${ownerId}: ${updatedListings.length}`);
                setRentalList(allListings);
            });
        });

    } catch (error) {
        console.log(`Error while getting all Rental in DB : ${error}`);
    }
};

    const bookingCar = async (rental) => {
        Alert.alert(
            "Confirm Booking",
            "Are you sure to book this car?",
            [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Ok",
                onPress: async () => {
                    try {
                        const bookingData = {
                            ...rental,
                            bookingStatus: "Pending",
                            bookingDate: new Date().toISOString()
                        }

                        const renterCollectionRef = collection(db, 'Renter DB', userId, 'Booking')
                        await addDoc(renterCollectionRef, bookingData)

                        const ownerCollectionRef = doc(db, 'Car Owner DB', rental.ownerId, 'Listing', rental.carId)
                        await updateDoc(ownerCollectionRef, { carStatus: "Pending" })
                        await updateDoc(renterCollectionRef, { carStatus: "Pending" })

                        console.log(`Booking saved ${bookingData} to renter db`)
                        alert('Booking Successful')
                        setSummaryVisible(false)
                        // getRentalList(currentCity)
                    } catch (err) {
                        console.log(`Error while saving to renter db : ${err}`)
                    }
                }
            }
            ],
            { cancelable: false }
        )
    }

    //Set headerleft options
    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    navigation.navigate("ReservationScreen", { userId })
                }}
                >
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>{`Manage\nReservations`}</Text>
                </TouchableOpacity>
            )
        })
    }, [])

    const closeSummary = () => {
        setSummaryVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* associate the reference to the MapView */}
            <MapView
                ref={mapRef}
                initialRegion={defaultRegion}
                style={styles.map}
                showsUserLocation={true}
            >
                {
                    rentalList.map(rental => (
                        console.log(`rental: ${rental}`),
                        <Marker
                            key={`${rental.ownerId}-${rental.carId}`}
                            coordinate={{
                                latitude: rental.lat,
                                longitude: rental.lng
                            }}
                            onPress={() => {
                                // alert("You're here !")
                                setSelectedRental(rental)
                                setSummaryVisible(true)
                            }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>${rental.rentalPrice}</Text>
                                </View>
                                <View style={styles.marker} />

                            </View>
                        </Marker>
                    ))
                }

            </MapView>
            <RentalSummary
                style={styles.rentalSummary}
                rental={selectedRental}
                visible={summaryVisible}
                onClose={closeSummary}
                onBook={bookingCar}
            />
        </View>
    )
}

export default SearchScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },

    map: {
        width: '100%',
        height: '100%',
    },

    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
    titleContainer: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 5,
        marginBottom: 2,
        borderWidth: 0.5,
        borderColor:'gray',
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
    },

    rentalSummary: {
        marginBottom: 0,
    }

})