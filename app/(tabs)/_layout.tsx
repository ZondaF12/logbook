import React, { useEffect } from "react";
import {
    Tabs,
    useRootNavigationState,
    useRouter,
    useSegments,
} from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import {
    AntDesign,
    Feather,
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
    Octicons,
} from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";

export default function TabLayout() {
    const segments = useSegments();
    const { session } = useAuth();
    const router = useRouter();

    const rootNavigationState = useRootNavigationState();
    if (!rootNavigationState?.key) return null;

    useEffect(() => {
        if (!session && segments[1] === "(auth)") {
            router.replace("/login");
        }
    }, [segments[1], session]);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.dark,
                tabBarInactiveTintColor: Colors.grey,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="(auth)/index"
                options={{
                    headerShown: false,
                    tabBarLabel: "Explore",
                    tabBarIcon: ({ color, size }) => (
                        <Octicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(auth)/search"
                options={{
                    headerShown: false,
                    tabBarLabel: "Search",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        if (!session) {
                            router.push("/(modals)/login");
                        } else {
                            router.push("/search");
                        }
                    },
                }}
            />
            <Tabs.Screen
                name="(auth)/new-post-tab"
                options={{
                    headerShown: false,
                    tabBarLabel: "Add Vehicle",
                    tabBarIcon: ({ color, size }) => (
                        <TouchableOpacity
                            onPress={() =>
                                router.push("/new-vehicle/registration")
                            }
                        >
                            <Feather
                                name="plus-square"
                                size={size}
                                color={color}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tabs.Screen
                name="(auth)/history"
                options={{
                    headerShown: false,
                    tabBarLabel: "History Files",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="history"
                            size={size}
                            color={color}
                        />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        if (!session) {
                            router.push("/(modals)/login");
                        } else {
                            router.push("/history");
                        }
                    },
                }}
            />
            <Tabs.Screen
                name="(auth)/my-profile"
                options={{
                    headerShown: false,
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ size, color }) => (
                        <MaterialCommunityIcons
                            name="account"
                            size={size}
                            color={color}
                        />
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        if (!session) {
                            router.push("/(modals)/login");
                        } else {
                            router.push("/my-profile");
                        }
                    },
                }}
            />
        </Tabs>
    );
}
