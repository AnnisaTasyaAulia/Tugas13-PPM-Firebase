import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, View, Image, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Button, Dimensions, Animated } from 'react-native';
import { fetchCategories } from "../API/Api";
import Ionicons from 'react-native-vector-icons/Ionicons';
import bannerImage from '../assets/banner.jpeg';

export default function HomeScreen({ navigation }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [addMenuVisible, setAddMenuVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [newMenuName, setNewMenuName] = useState('');
    const [newMenuPrice, setNewMenuPrice] = useState('');
    const [newMenuImage, setNewMenuImage] = useState('');
    const [newMenuDescription, setNewMenuDescription] = useState('');
    const [orientation, setOrientation] = useState('portrait');
    const [searchQuery, setSearchQuery] = useState('');
    const scrollY = useRef(new Animated.Value(0)).current; // Animated value untuk scroll
    const [iconVisible, setIconVisible] = useState(true); // State untuk mengontrol visibilitas ikon
    const scrollTimeout = useRef(null);

    const [categoryPrices, setCategoryPrices] = useState({
        "Seafood": "$25.99",
        "Vegetarian": "$15.99",
        "Dessert": "$12.99",
        "Beef": "$30.99",
        "Chicken": "$20.99",
        "Pasta": "$18.99",
        "Pork": "$29.99",
        "Breakfast": "$10.99",
        "Lamb": "$17.99",
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Gagal memuat kategori:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const updateLayout = () => {
            const { width, height } = Dimensions.get('window');
            setOrientation(width > height ? 'landscape' : 'portrait');
        };

        const subscription = Dimensions.addEventListener('change', updateLayout);
        updateLayout(); // Panggil fungsi untuk set awal

        return () => {
            subscription?.remove(); // Menghapus listener saat komponen di-unmount
        };
    }, []);

    const handleCategoryPress = async (category) => {
        try {
            const imagesData = await fetchCategories(category);
            navigation.navigate('DetailScreen', { category, images: imagesData });
        } catch (error) {
            console.error("Gagal mengambil gambar untuk kategori:", error);
        }
    };

    const handleDeleteCategory = (category) => {
        setCategories(categories.filter(item => item.strCategory !== category));
        setModalVisible(false);
    };

    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        const price = categoryPrices[category];
        if (price) {
            setNewPrice(price.replace('$', ''));
        } else {
            setNewPrice('');
        }
        setModalVisible(true);
    };

    const handleSaveEdit = () => {
        if (selectedCategory) {
            setCategoryPrices(prevPrices => ({
                ...prevPrices,
                [selectedCategory]: `$${newPrice}`
            }));
            setModalVisible(false);
        }
    };

    const handleMoreOptions = (category) => {
        Alert.alert(
            "Choose Action",
            `What would you like to do with the ${category}?`,
            [
                { text: "Edit", onPress: () => handleEditCategory(category) },
                { text: "Delete", onPress: () => handleDeleteCategory(category), style: "destructive" },
                { text: "Cancel", style: "cancel" }
            ],
            { cancelable: true }
        );
    };

    const handleAddMenu = () => {
        const newCategory = {
            strCategory: newMenuName,
            strCategoryThumb: newMenuImage,
            strCategoryDescription: newMenuDescription,
        };
        setCategories([...categories, newCategory]);
        setCategoryPrices(prevPrices => ({
            ...prevPrices,
            [newMenuName]: `$${newMenuPrice}`
        }));
        setAddMenuVisible(false);
        setNewMenuName('');
        setNewMenuPrice('');
        setNewMenuImage('');
        setNewMenuDescription('');
        Alert.alert('Menu successfully added');
    };

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        // Sembunyikan ikon saat menggulir
        setIconVisible(false);
        // Reset timer jika pengguna masih menggulir
        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }
        // Timer untuk menampilkan ikon kembali setelah berhenti menggulir
        scrollTimeout.current = setTimeout(() => {
            setIconVisible(true);
        }, 200); // 200ms setelah berhenti menggulir
    };

    useEffect(() => {
        return () => {
            // Hapus timer saat komponen di-unmount
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    const headerContainerStyle = orientation === 'portrait' ? styles.headerContainerPortrait : styles.headerContainerLandscape;

    return (
        <SafeAreaView style={styles.container}>
            <View style={headerContainerStyle}>
                <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>Location</Text>
                    <Text style={styles.currentLocationText}>Jl. Srikandi</Text>
                </View>
                <View style={styles.iconContainer}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart-outline" size={26} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={26} color="#000" />
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
                <Image source={bannerImage} style={styles.banner} />
                <View style={styles.header}>
                    <Text style={styles.title}>Menu</Text>
                    <TouchableOpacity style={styles.menuIcon} onPress={() => setAddMenuVisible(true)}>
                        <Ionicons name="menu-outline" size={26} color="#000" />
                    </TouchableOpacity>
                </View>
                {categories.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <TouchableOpacity style={styles.cardContent} onPress={() => handleCategoryPress(item.strCategory)}>
                            <Image source={{ uri: item.strCategoryThumb }} style={styles.image} />
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{item.strCategory}</Text>
                                <Text style={styles.cardPrice}>{categoryPrices[item.strCategory] || "$13.99"}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreIcon} onPress={() => handleMoreOptions(item.strCategory)}>
                            <Ionicons name="ellipsis-vertical-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <Animated.View style={[styles.bottomIcons, { opacity: iconVisible ? 1 : 0 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('HomeScreen')}>
                    <Ionicons name='home-outline' size={25} color="#000" />
                    <Text style={styles.iconText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('OrderScreen')}>
                    <Ionicons name='cart-outline' size={25} color='#000' />
                    <Text style={styles.iconText}>Cart</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEEEE5',
        padding: 10,
    },
    headerContainerPortrait: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingBottom: 20,
        borderRadius: 8,
        backgroundColor: '#fff',
        flexWrap: 'wrap', // Memungkinkan elemen berpindah ke baris baru jika diperlukan
    },
    headerContainerLandscape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#fff',
        flexWrap: 'wrap',
    },
    locationContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 15,
    },
    locationText: {
        fontSize: 15,
        fontWeight: 'normal',
        marginLeft: 5,
    },
    currentLocationText: {
        fontSize: 17,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 18,
        marginRight: 2,
    },
    iconButton: {
        marginHorizontal: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginTop: 30,
        alignSelf: 'center', // Tempatkan di tengah
        width: '100%', // Batasi lebar 
    },
    bannerPortrait: {
        width: '100%',
        height: 200,
    },
    bannerLandscape: {
        width: '100%',
        height: 100,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        paddingLeft: 10,
    },
    card: {
        backgroundColor: '#FDE0CF',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        position: 'relative',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 8,
    },
    textContainer: {
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardPrice: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    moreIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#FDE0CF',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: '100%',
        borderRadius: 5,
        marginBottom: 10,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    bottomIcons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 5,
        borderColor: '#fff',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    iconButton: {
        alignItems: 'center',
    },
    iconText: {
        fontSize: 12,
        color: '#555',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        paddingLeft: 0,
        paddingRight: 3,
    },
    menuIcon: {
        padding: 5,
    },
    banner: {
        top: 8,
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
});
