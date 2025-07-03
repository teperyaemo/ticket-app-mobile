import { AuthContext } from "@/components/AuthProvider";
import { ConcertItem } from "@/components/ConcertItem";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import React, { useContext, useEffect, useState } from "react";
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
    image: string; // base64
    startedAt: string;
    ticketPrice: number;
    availableTicketAmount: number;
    isFavorite?: boolean;
}

interface Favorite {
    id: string;
    concertId: string;
    concert: Concert;
}

export default function TabTwoScreen() {
    const { token } = useContext(AuthContext);
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const loadConcertsWithFavorites = async () => {
        setLoading(true);
        try {
            // Параллельная загрузка концертов и избранного
            const [concertsResponse, favoritesResponse] = await Promise.all([
                fetch(
                    "https://teperyaemo.ru/api/Concert/paged?page=1&take=25&name=",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                ),
                fetch("https://teperyaemo.ru/api/Favorite", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (!concertsResponse.ok)
                throw new Error("Ошибка загрузки концертов");
            if (!favoritesResponse.ok)
                throw new Error("Ошибка загрузки избранного");

            const [concertsData, favoritesData] = await Promise.all([
                concertsResponse.json(),
                favoritesResponse.json(),
            ]);

            const concertsArray = concertsData?.items || concertsData || [];
            const favoritesArray = favoritesData || [];

            const favoriteIds = favoritesArray.map(
                (fav: Favorite) => fav.concertId
            );

            setConcerts(
                concertsArray.map((concert: Concert) => ({
                    ...concert,
                    isFavorite: favoriteIds.includes(concert.id),
                }))
            );
        } catch (err) {
            console.error("Ошибка загрузки:", err);
            Alert.alert("Не удалось загрузить данные");
            setConcerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadConcertsWithFavorites();
        }
    }, [token]);

    const searchConcerts = async () => {
        if (searchQuery.trim() === "") {
            loadConcertsWithFavorites();
            return;
        }

        setIsSearching(true);
        setLoading(true);
        try {
            const response = await fetch(
                `https://teperyaemo.ru/api/Concert/paged?page=1&take=25&name=${encodeURIComponent(
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
            const concertsArray = data?.items || data || [];

            setConcerts(concertsArray);
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

            loadConcertsWithFavorites();
        } catch (err) {
            Alert.alert("Ошибка", "Не удалось купить билет");
            console.error(err);
        }
    };

    const renderConcert = ({ item }: { item: Concert }) => (
        <ConcertItem
            item={item}
            token={token}
            onBuyTicket={buyTicket}
            onFavoriteToggle={(concertId, newStatus) => {
                setConcerts((prev) =>
                    prev.map((c) =>
                        c.id === concertId ? { ...c, isFavorite: newStatus } : c
                    )
                );
            }}
        />
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
                        <IconSymbol
                            name="magnifyingglass"
                            size={18}
                            color={""}
                        />
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
    reactLogo: {
        height: 250,
        width: 412,
        bottom: 0,
        left: 0,
        position: "absolute",
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
