import { router } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthContext } from "../components/AuthProvider";

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { logIn } = useContext(AuthContext);

    const handleAuth = async (isLogin: boolean) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://teperyaemo.ru/api/Auth/${
                    isLogin ? "login" : "register"
                }`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName: username, password }),
                }
            );

            const data = await response.json();

            if (response.ok && data.token) {
                await logIn(data.token);
                router.replace("/(portected)/(tabs)/home");
            } else {
                Alert.alert("Error", data.message || "Authentication failed");
            }
        } catch (error) {
            Alert.alert("Error", "Network request failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isLoading ? "Загрузка..." : "Добро пожаловать"}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Имя пользователя"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                <Button
                    title="Войти"
                    onPress={() => handleAuth(true)}
                    disabled={isLoading || !username || !password}
                />
                <Button
                    title="Зарегистрироваться"
                    onPress={() => handleAuth(false)}
                    disabled={isLoading || !username || !password}
                    color="#888"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        gap: 10,
    },
});
