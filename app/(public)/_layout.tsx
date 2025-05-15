import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../components/AuthProvider";

export default function PublicLayout() {
    const { token, isReady } = useContext(AuthContext);

    if (!isReady) return null;
    if (token) return <Redirect href="/(portected)/(tabs)/home" />;

    return <Stack screenOptions={{ headerShown: false }} />;
}
