import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

type AuthState = {
    token: string | null;
    isReady: boolean;
    logIn: (token: string) => Promise<void>;
    logOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
    token: null,
    isReady: false,
    logIn: async () => {},
    logOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
    const [state, setState] = useState<Omit<AuthState, "logIn" | "logOut">>({
        token: null,
        isReady: false,
    });

    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const token = await AsyncStorage.getItem("auth-token");
                setState({ token, isReady: true });
            } catch (error) {
                console.error("Auth loading error:", error);
                setState((s) => ({ ...s, isReady: true }));
            } finally {
                SplashScreen.hideAsync();
            }
        };

        loadAuthState();
    }, []);

    const logIn = async (token: string) => {
        await AsyncStorage.setItem("auth-token", token);
        setState((s) => ({ ...s, token }));
    };

    const logOut = async () => {
        await AsyncStorage.removeItem("auth-token");
        setState((s) => ({ ...s, token: null }));
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                logIn,
                logOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
