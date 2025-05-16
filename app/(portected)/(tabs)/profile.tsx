// app/(protected)/(tabs)/tickets.tsx
import { AuthContext } from "@/components/AuthProvider";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

interface UserProfile {
    id: string;
    userName: string;
    profilePicture: string;
    createdAt: string;
    role: string;
}

export default function ProfileScreen() {
    const { token, logOut } = useContext(AuthContext);
    const navigation = useNavigation();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            const response = await fetch("https://teperyaemo.ru/api/User/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Ошибка загрузки профиля");
            const data = await response.json();
            setProfile(data);
        } catch (err) {
            console.error("Ошибка при загрузке профиля:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setProfile(null);
        setLoading(true);
        fetchProfile();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = () => {
        logOut();
    };

    if (loading && !refreshing) {
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
                <ActivityIndicator size="large" style={styles.loader} />
            </ParallaxScrollView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {profile ? (
                <>
                    <ThemedView style={styles.profileSection}>
                        {profile.profilePicture ? (
                            <Image
                                style={styles.profileImage}
                                source={{
                                    uri: `data:image/png;base64,${profile.profilePicture}`,
                                }}
                            />
                        ) : (
                            <ThemedView style={styles.profileImagePlaceholder}>
                                <IconSymbol
                                    name="person.crop.circle"
                                    size={100}
                                    color={""}
                                />
                            </ThemedView>
                        )}
                        <ThemedText type="title" style={styles.userName}>
                            {profile.userName}
                        </ThemedText>
                        <ThemedText style={styles.memberSince}>
                            Участник с:{" "}
                            {new Date(profile.createdAt).toLocaleDateString()}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() =>
                                navigation.navigate("profile/favorites")
                            }
                        >
                            <IconSymbol
                                name="heart.fill"
                                size={24}
                                color={""}
                            />
                            <ThemedText style={styles.buttonText}>
                                Избранное
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() =>
                                navigation.navigate("profile/tickets-list")
                            }
                        >
                            <IconSymbol
                                name="ticket.fill"
                                size={24}
                                color={""}
                            />
                            <ThemedText style={styles.buttonText}>
                                Мои билеты
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.logoutButton]}
                            onPress={handleLogout}
                        >
                            <IconSymbol
                                name="arrow.right.square.fill"
                                size={24}
                                color={""}
                            />
                            <ThemedText style={styles.buttonText}>
                                Выйти
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </>
            ) : (
                <ThemedText style={styles.errorText}>
                    Не удалось загрузить профиль
                </ThemedText>
            )}
        </ThemedView>
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
    profileSection: {
        paddingTop: 30,
        alignItems: "center",
        marginBottom: 32,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 16,
    },
    profileImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e1e1e1",
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        marginBottom: 8,
    },
    memberSince: {
        fontSize: 14,
        color: "#666",
    },
    buttonsContainer: {
        gap: 16,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
    },
    buttonText: {
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: "#ffe5e5",
        marginTop: 32,
    },
    loader: {
        marginVertical: 20,
    },
    errorText: {
        textAlign: "center",
        color: "red",
        marginTop: 20,
    },
});
