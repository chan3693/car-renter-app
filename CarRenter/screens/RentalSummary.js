import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';


const RentalSummary = ({ rental, visible, onClose, onBook }) => {
    if (!rental) return null;
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.horizontal}>  
                        <View>
                            <Text style={styles.name}>{rental.vehicleName}</Text>
                            <Text style={styles.name}>Onwer : {rental.ownerName}</Text>
                            <Text style={styles.name}>licensePlate : {rental.licensePlate}</Text>
                        </View>  
                        <Image source={{uri: rental.ownerPhoto}} style={styles.imageOwner}/>
                    </View>
                    <Text style={styles.address}>Price / Week : ${rental.rentalPrice}</Text>
                    <Text style={styles.address}>Pickup Location : {rental.pickupLocation}</Text>
                    <Text></Text>
                    

                    <Image source={{ uri: rental.vehiclePhoto }} style={styles.image} />

                    <TouchableOpacity
                        onPress={() => { 
                            onBook(rental) 
                        }}
                        style={styles.btn}
                    >
                        <Text style={styles.btnLabel}>BOOK NOW</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default RentalSummary

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    ownerName:{
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    },
    btn: {
        backgroundColor: '#089cf5',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center',
        marginVertical: 10,
    },
    btnLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        width: '90%',
        height: 'auto',
    },
    imageOwner:{
        width: 80,
        height: 80,
        borderRadius: 500,
    }
});