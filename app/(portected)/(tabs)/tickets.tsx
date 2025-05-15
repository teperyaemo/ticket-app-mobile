import { AuthContext } from "@/components/AuthProvider";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
} from "react-native";

interface Ticket {
    id: string;
    concertId: string;
    concert: {
        id: string;
        name: string;
        startedAt: string;
        ticketPrice: number;
    };
}

export default function TicketsScreen() {
    const { token } = useContext(AuthContext);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTickets = async () => {
        try {
            const response = await fetch(
                "https://teperyaemo.ru/api/Ticket?page=1&take=25",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Ошибка загрузки билетов");

            const data = await response.json();
            setTickets(data);
        } catch (err) {
            console.error("Ошибка при загрузке билетов:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Загружаем билеты при монтировании
    useEffect(() => {
        fetchTickets();
    }, []);

    // Функция для ручного обновления
    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const renderTicket = ({ item }: { item: Ticket }) => (
        <ThemedView style={styles.ticketContainer}>
            <ThemedText type="title" style={styles.concertName}>
                {item.concert.name}
            </ThemedText>

            <ThemedView style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>
                    Дата концерта:
                </ThemedText>
                <ThemedText style={styles.detailValue}>
                    {new Date(item.concert.startedAt).toLocaleString()}
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Цена билета:</ThemedText>
                <ThemedText style={styles.detailValue}>
                    {item.concert.ticketPrice} ₽
                </ThemedText>
            </ThemedView>
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
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>
                    Мои билеты
                </ThemedText>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" style={styles.loader} />
                ) : tickets.length === 0 ? (
                    <ThemedText style={styles.noTickets}>
                        У вас пока нет купленных билетов
                    </ThemedText>
                ) : (
                    <FlatList
                        data={tickets}
                        renderItem={renderTicket}
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
    reactLogo: {
        height: 250,
        width: 412,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    title: {
        marginBottom: 20,
        textAlign: "center",
    },
    ticketContainer: {
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: "#f5f5f5",
    },
    concertName: {
        fontSize: 18,
        marginBottom: 12,
        textAlign: "center",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    detailLabel: {
        fontWeight: "bold",
        color: "#555",
    },
    detailValue: {
        color: "#333",
    },
    loader: {
        marginVertical: 20,
    },
    noTickets: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#666",
    },
    listContent: {
        paddingBottom: 20,
    },
    refreshText: {
        textAlign: "center",
        color: "#666",
        marginTop: 10,
    },
});
