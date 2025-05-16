import { AuthContext } from "@/components/AuthProvider";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
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

    useEffect(() => {
        setTickets([]);
        setLoading(true);
        fetchTickets();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const renderTicket = ({ item }: { item: Ticket }) => (
        <ThemedView style={styles.ticketContainer}>
            <ThemedText type="title" style={styles.concertName}>
                {item.concert.name}
            </ThemedText>

            <ThemedView style={styles.detailsContainer}>
                <ThemedView style={styles.detailItem}>
                    <IconSymbol
                        name="calendar"
                        size={18}
                        style={styles.icon}
                        color={""}
                    />
                    <ThemedText style={styles.detailText}>
                        {new Date(item.concert.startedAt).toLocaleDateString(
                            "ru-RU",
                            {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailItem}>
                    <IconSymbol
                        name="ticket.fill"
                        size={18}
                        style={styles.icon}
                        color={""}
                    />
                    <ThemedText style={styles.detailText}>
                        Билет #{item.id.slice(0, 8).toUpperCase()}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailItem}>
                    <IconSymbol
                        name="rublesign"
                        size={18}
                        style={styles.icon}
                        color={""}
                    />
                    <ThemedText style={styles.priceText}>
                        {item.concert.ticketPrice.toLocaleString("ru-RU")} ₽
                    </ThemedText>
                </ThemedView>
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
            <ThemedText type="title" style={styles.title}>
                Мои билеты
            </ThemedText>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : tickets.length === 0 ? (
                <ThemedView style={styles.emptyContainer}>
                    <IconSymbol
                        name="ticket.fill"
                        size={64}
                        style={styles.emptyIcon}
                        color={""}
                    />
                    <ThemedText style={styles.emptyText}>
                        У вас пока нет активных билетов
                    </ThemedText>
                </ThemedView>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderTicket}
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
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 30,
        textAlign: "center",
    },
    ticketContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    concertName: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 15,
        color: "#1A1A1A",
    },
    detailsContainer: {
        gap: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    icon: {
        color: "#666",
    },
    detailText: {
        fontSize: 16,
        color: "#444",
    },
    priceText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2A9D8F",
    },
    loader: {
        marginVertical: 40,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyIcon: {
        opacity: 0.5,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    listContent: {
        paddingBottom: 20,
    },
});
