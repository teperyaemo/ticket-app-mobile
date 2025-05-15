import { AuthContext } from "@/components/AuthProvider";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

interface Post {
    id: string;
    text: string;
    createdAt: string;
    userId: string;
}

export default function HomeScreen() {
    const { logOut, token } = useContext(AuthContext);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(
                    "https://teperyaemo.ru/api/Post/paged?page=1&take=25",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);

                // Правильно читаем JSON из ответа
                const responseData = await response.json();
                console.log("Полученные данные:", responseData); // Для отладки

                // Проверяем разные варианты структуры ответа
                const postsData =
                    responseData.items || responseData.data || responseData;
                setPosts(Array.isArray(postsData) ? postsData : [postsData]);
            } catch (err) {
                console.error("Ошибка при загрузке:", err);
                setError("Не удалось загрузить посты");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchPosts();
    }, [token]);

    const renderItem = ({ item }: { item: Post }) => (
        <ThemedView style={styles.postContainer}>
            <ThemedText style={styles.postDate}>
                {new Date(item.createdAt).toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.postText}>{item.text}</ThemedText>
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
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Последние посты</ThemedText>
                <HelloWave />
            </ThemedView>

            <TouchableOpacity onPress={logOut} style={styles.logoutButton}>
                <ThemedText type="defaultSemiBold" style={styles.logoutText}>
                    Выйти из аккаунта
                </ThemedText>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : error ? (
                <ThemedView style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                </ThemedView>
            ) : posts.length === 0 ? (
                <ThemedView style={styles.errorContainer}>
                    <ThemedText>Посты не найдены</ThemedText>
                </ThemedView>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    postContainer: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#f5f5f5",
    },
    postDate: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    postText: {
        marginTop: 8,
        lineHeight: 20,
    },
    loader: {
        marginVertical: 20,
    },
    errorContainer: {
        padding: 16,
        backgroundColor: "#ffe6e6",
        borderRadius: 8,
    },
    errorText: {
        color: "#ff0000",
    },
    listContent: {
        paddingBottom: 32,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    logoutButton: {
        backgroundColor: "#ff4444",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    logoutText: {
        color: "white",
    },
});
