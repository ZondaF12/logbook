import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import * as Updates from "expo-updates";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(modals)/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        "font-b": require("../assets/fonts/Gilroy-Bold.ttf"),
        "font-s": require("../assets/fonts/Gilroy-SemiBold.ttf"),
        "font-mi": require("../assets/fonts/Gilroy-MediumItalic.ttf"),
        "font-m": require("../assets/fonts/Gilroy-Medium.ttf"),
        "font-serif": require("../assets/fonts/HVAnalogueBold.ttf"),
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </QueryClientProvider>
    );
}

function RootLayoutNav() {
    const { authState } = useAuth();

    async function onFetchUpdateAsync() {
        try {
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            // You can also add an alert() to see the error message in case of an error when fetching updates.
            alert(`Error fetching latest Expo update: ${error}`);
        }
    }

    useEffect(() => {
        if (
            authState?.authenticated ||
            authState?.authenticated === null ||
            !authState?.authenticated
        ) {
            // This tells the splash screen to hide immediately! If we call this after
            // `setAppIsReady`, then we may see a blank screen while the app is
            // loading its initial state and rendering its first pixels. So instead,
            // we hide the splash screen once we know the root view has already
            // performed layout.
            void SplashScreen.hideAsync();
        }
    }, [authState]);

    useEffect(() => {
        if (!__DEV__) {
            onFetchUpdateAsync();
        }
    }, []);

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="(modals)/login"
                options={{
                    presentation: "fullScreenModal",
                    headerShown: false,
                    animation: "slide_from_bottom",
                }}
            />
            <Stack.Screen
                name="(modals)/onboarding-username"
                options={{
                    animation: "slide_from_right",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="(modals)/onboarding-firstname"
                options={{
                    animation: "slide_from_right",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="new-vehicle/registration"
                options={{
                    headerShown: false,
                    animation: "slide_from_bottom",
                }}
            />
            <Stack.Screen
                name="new-vehicle/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="vehicle-details/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="vehicle-details/set-description/[id]"
                options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
                name="vehicle-details/settings/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="vehicle-details/settings/handover/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="edit-profile/[id]"
                options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
                name="profile/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="new-logbook/[id]"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="new-logbook/add/[id]"
                options={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            />
            <Stack.Screen
                name="logbooks/[id]"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="logbooks/item/[id]"
                options={{ headerShown: false, presentation: "modal" }}
            />
        </Stack>
    );
}
