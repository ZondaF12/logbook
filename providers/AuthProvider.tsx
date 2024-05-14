import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
const Buffer = require("buffer").Buffer;

interface AuthProps {
    authState?: {
        token: string | null;
        userId: string | null;
        authenticated: boolean | null;
    };
    onRegister?: (email: string, password: string) => Promise<any>;
    login?: (email: string, password: string) => Promise<any>;
    logout?: () => Promise<any>;
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        userId: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        userId: null,
        authenticated: null,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(
                process.env.EXPO_PUBLIC_TOKEN_KEY!
            );

            const userId = await SecureStore.getItemAsync(
                process.env.EXPO_PUBLIC_USER_ID_KEY!
            );

            console.log(token, userId);

            if (token && userId) {
                axios.defaults.headers.common["Authorization"] = `${token}`;

                setAuthState({
                    token: token,
                    userId: userId,
                    authenticated: true,
                });
            }
        };

        loadToken();
    }, []);

    const register = async (email: string, password: string) => {
        try {
            const res = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/api/v1/register`,
                {
                    email,
                    password,
                }
            );

            return res.data;
        } catch (err) {
            console.log(err);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/api/v1/login`,
                {
                    email,
                    password,
                }
            );

            const headers = res.headers;

            setAuthState({
                token: headers["x-logbook-token"],
                userId: res.data.userId,
                authenticated: true,
            });

            axios.defaults.headers.common[
                "Authorization"
            ] = `${headers["x-logbook-token"]}`;

            await SecureStore.setItemAsync(
                process.env.EXPO_PUBLIC_TOKEN_KEY!,
                headers["x-logbook-token"]
            );

            await SecureStore.setItemAsync(
                process.env.EXPO_PUBLIC_USER_ID_KEY!,
                res.data.userId
            );

            return res.data;
        } catch (err) {
            console.log(err);
        }
    };

    const logout = async () => {
        // Delete the token from the secure store
        await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_TOKEN_KEY!);
        await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_USER_ID_KEY!);

        // Remove the token from the axios headers
        axios.defaults.headers.common["Authorization"] = ``;

        // Update the auth state
        setAuthState({
            token: null,
            userId: null,
            authenticated: false,
        });
    };

    const value = {
        onRegister: register,
        login,
        logout,
        authState,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
