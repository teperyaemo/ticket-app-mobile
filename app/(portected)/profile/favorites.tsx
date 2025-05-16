// app/(protected)/profile/favorites.tsx
import { AuthContext } from "@/components/AuthProvider";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

interface Favorite {
    id: string;
    concert: {
        id: string;
        name: string;
        startedAt: string;
        ticketPrice: number;
        image: string;
    };
}

export default function FavoritesScreen() {
    const { token } = useContext(AuthContext);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = async () => {
        try {
            const response = await fetch("https://teperyaemo.ru/api/Favorite", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Ошибка загрузки избранного");
            const data = await response.json();
            setFavorites(data);
        } catch (err) {
            console.error("Ошибка при загрузке избранного:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setFavorites([]);
        setLoading(true);
        fetchFavorites();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavorites();
    };

    const handleRemoveFavorite = async (favoriteId: string) => {
        try {
            await fetch(`https://teperyaemo.ru/api/Favorite/${favoriteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
        } catch (err) {
            console.error("Ошибка при удалении из избранного:", err);
        }
    };

    const renderFavoriteItem = ({ item }: { item: Favorite }) => (
        <ThemedView style={styles.card}>
            {item.concert.image ? (
                <Image
                    source={{
                        uri: `data:image/png;base64,${item.concert.image}`,
                    }}
                    style={styles.concertImage}
                />
            ) : (
                <ThemedView style={styles.imagePlaceholder}>
                    <IconSymbol name="music.note" size={40} color={""} />
                </ThemedView>
            )}

            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    {item.concert.name}
                </ThemedText>

                <ThemedView style={styles.details}>
                    <ThemedView style={styles.detailRow}>
                        <IconSymbol name="calendar" size={16} color={""} />
                        <ThemedText style={styles.detailText}>
                            {new Date(
                                item.concert.startedAt
                            ).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.detailRow}>
                        <IconSymbol name="ticket.fill" size={16} color={""} />
                        <ThemedText style={styles.priceText}>
                            {item.concert.ticketPrice.toLocaleString("ru-RU")} ₽
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFavorite(item.id)}
                >
                    <IconSymbol name="heart.slash" size={20} color="#ff4444" />
                    <ThemedText style={styles.removeButtonText}>
                        Удалить из избранного
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <ThemedText type="title" style={styles.header}>
                Избранные концерты
            </ThemedText>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : favorites.length === 0 ? (
                <ThemedView style={styles.emptyState}>
                    <IconSymbol
                        name="heart.fill"
                        size={64}
                        style={styles.emptyIcon}
                        color={""}
                    />
                    <ThemedText style={styles.emptyText}>
                        Здесь будут ваши избранные концерты
                    </ThemedText>
                </ThemedView>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 25,
        textAlign: "center",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        overflow: "hidden",
    },
    concertImage: {
        width: "100%",
        height: 180,
        backgroundColor: "#f0f0f0",
    },
    imagePlaceholder: {
        width: "100%",
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        color: "#1a1a1a",
    },
    details: {
        gap: 10,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: "#444",
    },
    priceText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#2A9D8F",
    },
    removeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        backgroundColor: "#fff0f0",
        borderRadius: 8,
        justifyContent: "center",
        marginTop: 10,
    },
    removeButtonText: {
        color: "#ff4444",
        fontWeight: "500",
    },
    loader: {
        marginVertical: 40,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        marginTop: 50,
    },
    emptyIcon: {
        opacity: 0.3,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    listContent: {
        paddingBottom: 30,
    },
});
