import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

interface Concert {
    id: string;
    name: string;
    image: string; // base64
    startedAt: string;
    ticketPrice: number;
    availableTicketAmount: number;
    isFavorite?: boolean;
}

interface ConcertItemProps {
    item: Concert;
    token: string | null;
    onBuyTicket: (concertId: string) => Promise<void>;
    onFavoriteToggle: (concertId: string, newStatus: boolean) => void;
}

export const ConcertItem = ({ item, token, onBuyTicket }: ConcertItemProps) => {
    const [isFavorite, setIsFavorite] = useState(item.isFavorite || false);

    const toggleFavorite = async () => {
        try {
            const method = isFavorite ? "DELETE" : "POST";
            const response = await fetch(
                `https://teperyaemo.ru/api/Favorite/${item.id}`,
                {
                    method,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok)
                throw new Error("Ошибка при обновлении избранного");

            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error("Ошибка:", err);
            Alert.alert("Ошибка", "Не удалось обновить избранное");
        }
    };

    return (
        <ThemedView style={styles.concertContainer}>
            {item.image && (
                <Image
                    source={{ uri: `data:image/png;base64,${item.image}` }}
                    style={styles.concertImage}
                    contentFit="cover"
                />
            )}

            <ThemedView style={styles.concertDetails}>
                <ThemedText type="title" style={styles.concertName}>
                    {item.name}
                </ThemedText>

                <ThemedView style={styles.concertInfo}>
                    <ThemedText style={styles.concertDate}>
                        {new Date(item.startedAt).toLocaleString()}
                    </ThemedText>
                    <ThemedText style={styles.concertPrice}>
                        {item.ticketPrice} ₽
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.buyButton,
                            item.availableTicketAmount <= 0 &&
                                styles.buyButtonDisabled,
                        ]}
                        onPress={() => onBuyTicket(item.id)}
                        disabled={item.availableTicketAmount <= 0}
                    >
                        <ThemedText style={styles.buyButtonText}>
                            {item.availableTicketAmount > 0
                                ? "Купить билет"
                                : "Распродано"}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.favoriteButton,
                            isFavorite && styles.favoriteButtonActive,
                        ]}
                        onPress={toggleFavorite}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={24}
                            color={isFavorite ? "#FF3B30" : "#000000"}
                        />
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    concertContainer: {
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
        backgroundColor: "#fff",
        elevation: 3,
    },
    concertImage: {
        width: "100%",
        height: 180,
    },
    concertDetails: {
        padding: 16,
    },
    concertName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    concertInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    concertDate: {
        fontSize: 14,
        color: "#555",
    },
    concertPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2e86de",
    },
    concertDetail: {
        fontSize: 14,
        marginBottom: 4,
        color: "#555",
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },

    favoriteButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },

    favoriteButtonActive: {
        backgroundColor: "rgba(255, 59, 48, 0.1)",
    },
    buyButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    buyButtonDisabled: {
        backgroundColor: "#cccccc",
    },
    buyButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
