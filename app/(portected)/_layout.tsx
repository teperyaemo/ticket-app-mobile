import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../components/AuthProvider";

export default function ProtectedLayout() {
    const { token, isReady } = useContext(AuthContext);

    if (!isReady) return null;
    if (!token) return <Redirect href="/login" />;

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
    );
}
