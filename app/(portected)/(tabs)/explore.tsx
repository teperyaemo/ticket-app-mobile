import { AuthContext } from "@/components/AuthProvider";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

interface Concert {
    id: string;
    name: string;
    startedAt: string;
    availableTicketAmount: number;
    ticketPrice: number;
    createdAt: string;
}

export default function TabTwoScreen() {
    const { token } = useContext(AuthContext);
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            fetchConcerts();
        }
    }, [searchQuery]);

    const fetchConcerts = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "https://teperyaemo.ru/api/Concert/paged?page=1&take=25",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Ошибка загрузки концертов");

            const data = await response.json();
            setConcerts(data.items || data);
        } catch (err) {
            Alert.alert("Ошибка", "Не удалось загрузить концерты");
            console.error(err);
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    const searchConcerts = async () => {
        if (searchQuery.trim() === "") {
            fetchConcerts();
            return;
        }

        setIsSearching(true);
        setLoading(true);
        try {
            const response = await fetch(
                `https://teperyaemo.ru/api/Concert/name/${encodeURIComponent(
                    searchQuery
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Ошибка поиска");

            const data = await response.json();
            setConcerts(Array.isArray(data) ? data : [data]);
        } catch (err) {
            Alert.alert("Ошибка", "Не удалось выполнить поиск");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const buyTicket = async (concertId: string) => {
        try {
            const response = await fetch(
                `https://teperyaemo.ru/api/Concert/buyTicket/${concertId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Ошибка покупки билета");

            Alert.alert("Успех", "Билет успешно приобретен!");
            // Обновляем список концертов после покупки
            fetchConcerts();
        } catch (err) {
            Alert.alert("Ошибка", "Не удалось купить билет");
            console.error(err);
        }
    };

    const renderConcert = ({ item }: { item: Concert }) => (
        <ThemedView style={styles.concertContainer}>
            <ThemedText type="defaultSemiBold" style={styles.concertName}>
                {item.name}
            </ThemedText>
            <ThemedText style={styles.concertDetail}>
                Дата: {new Date(item.startedAt).toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.concertDetail}>
                Цена: {item.ticketPrice} ₽
            </ThemedText>
            <ThemedText style={styles.concertDetail}>
                Доступно билетов: {item.availableTicketAmount}
            </ThemedText>

            <TouchableOpacity
                style={styles.buyButton}
                onPress={() => buyTicket(item.id)}
                disabled={item.availableTicketAmount <= 0}
            >
                <ThemedText style={styles.buyButtonText}>
                    {item.availableTicketAmount > 0
                        ? "Купить билет"
                        : "Билетов нет"}
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                <Image
                    source={require("@/assets/images/partial-react-logo.png")}
                    style={styles.reactLogo}
                />
            }
        >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Поиск концертов..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={searchConcerts}
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={searchConcerts}
                        disabled={loading}
                    >
                        <ThemedText>Поиск</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {loading ? (
                    <ActivityIndicator size="large" style={styles.loader} />
                ) : concerts.length === 0 ? (
                    <ThemedText style={styles.noResults}>
                        {isSearching
                            ? "Концерты не найдены"
                            : "Нет доступных концертов"}
                    </ThemedText>
                ) : (
                    <FlatList
                        data={concerts}
                        renderItem={renderConcert}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    searchButton: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15,
        backgroundColor: "#ddd",
        borderRadius: 5,
    },
    concertContainer: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: "#f5f5f5",
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    concertName: {
        fontSize: 18,
        marginBottom: 8,
    },
    concertDetail: {
        fontSize: 14,
        marginBottom: 4,
        color: "#555",
    },
    buyButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        backgroundColor: "#4CAF50",
    },
    buyButtonDisabled: {
        backgroundColor: "#cccccc",
    },
    buyButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    loader: {
        marginVertical: 20,
    },
    noResults: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#666",
    },
    listContent: {
        paddingBottom: 20,
    },
});
