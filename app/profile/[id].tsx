import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    LayoutAnimation,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader/Loader";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeOutLeft,
    FadeOutRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { Image } from "react-native-elements";
import { FlashList } from "@shopify/flash-list";
import MyVehicle from "@/components/Garage/MyVehicle";
import { supabase } from "@/lib/supabase";

const ProfileDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [fleetHeight, setFleetHeight] = useState<number | undefined>(
        undefined
    );

    const router = useRouter();
    const { logout } = useAuth();

    const getUserProfile = async () => {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("user_id", id);

        if (data) {
            return data[0];
        }
    };

    const {
        data: profile,
        isLoading: isLoadingProfile,
        isError,
        error,
        refetch: refetchProfile,
    } = useQuery({
        queryKey: ["usersearch"],
        queryFn: getUserProfile,
    });

    const fetchUserVehicles = async () => {
        const { data, error } = await supabase
            .from("user_vehicles")
            .select()
            .eq("user_id", id);

        if (data) {
            return data;
        }
    };

    const {
        data: vehicles,
        refetch: refetchVehicle,
        isLoading: isGettingVehicles,
    } = useQuery({
        queryKey: ["search_profile_vehicles"],
        queryFn: fetchUserVehicles,
    });

    if (isLoadingProfile) {
        return <Loader />;
    }

    if (isError) {
        return <Text>{error.message}</Text>;
    }

    if (!profile) {
        return logout();
    }

    const handleFollow = async () => {
        // if (!session) {
        //     return router.push("/(modals)/login");
        // }
        // try {
        //     await usersApi.usersControllerFollowUser(profile.id, {
        //         headers: {
        //             Authorization: `Bearer ${session?.accessToken}`,
        //         },
        //     });
        //     refetchIsFollowing();
        //     refetchProfile();
        // } catch (error) {
        //     console.log("Error", error);
        // }
    };

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView />

            <TouchableOpacity onPress={() => router.back()}>
                <Animated.View
                    entering={FadeInLeft.springify().delay(800)}
                    exiting={FadeOutRight}
                    style={{
                        padding: 10,
                        borderRadius: 99,
                        overflow: "hidden",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        paddingRight: 100,
                    }}
                >
                    <Ionicons name="arrow-back" size={30} color="black" />
                </Animated.View>
            </TouchableOpacity>

            <View style={{ flex: 1, gap: 15 }}>
                <View style={{ paddingHorizontal: 15, gap: 15 }}>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Animated.Text
                            entering={FadeInLeft.springify()}
                            exiting={FadeOutLeft}
                            style={Theme.BigTitle}
                        >
                            @{profile.username}
                        </Animated.Text>

                        <Pressable
                            // disabled={isCheckingFollowing || isLoadingProfile}
                            onPress={handleFollow}
                        >
                            <Animated.View
                                entering={FadeInRight.springify().delay(100)}
                                exiting={FadeOutRight}
                                style={{
                                    padding: 10,
                                    borderRadius: 99,
                                    overflow: "hidden",
                                    backgroundColor: "transparent",
                                    borderWidth: 1,
                                    borderColor: Colors.dark,
                                }}
                            >
                                <Text
                                    style={[
                                        Theme.ButtonText,
                                        {
                                            color: Colors.dark,
                                        },
                                    ]}
                                >
                                    {"Following"}
                                </Text>
                            </Animated.View>
                        </Pressable>
                    </View>

                    <View
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 15,
                        }}
                    >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <Image
                                source={{ uri: profile.avatar }}
                                style={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: 99,
                                }}
                            />

                            <View
                                style={{
                                    flex: 1,
                                    position: "relative",
                                    gap: 5,
                                }}
                            >
                                <Text style={Theme.Title}>
                                    {/* {profile.firstname} */}
                                    Ruaridh
                                </Text>

                                <View
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={[
                                            Theme.BodyText,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        1200 followers
                                    </Text>
                                    <Text
                                        style={[
                                            Theme.BodyText,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        123 following
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {profile.bio && profile.bio.length > 1 && (
                            <Text
                                style={[Theme.BodyText, { color: Colors.grey }]}
                            >
                                {profile.bio}
                            </Text>
                        )}
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: 15,
                    }}
                    onLayout={(e) => {
                        if (fleetHeight) {
                            e.nativeEvent.layout.height < fleetHeight &&
                                setFleetHeight(
                                    e.nativeEvent.layout.height / 2.5
                                );
                        } else {
                            LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut
                            );
                            setFleetHeight(e.nativeEvent.layout.height / 2.5);
                        }
                    }}
                >
                    {fleetHeight ? (
                        profile.public ? (
                            vehicles && vehicles?.length > 0 ? (
                                <View
                                    style={{
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        overflow: "hidden",
                                        flexGrow: 1,
                                    }}
                                >
                                    <FlashList
                                        estimatedItemSize={fleetHeight - 40}
                                        ListFooterComponent={
                                            <View
                                                style={{
                                                    height: 50,
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        Theme.BodyText,
                                                        { color: Colors.grey },
                                                    ]}
                                                >
                                                    {vehicles?.length}{" "}
                                                    {vehicles?.length > 1
                                                        ? "Vehicles"
                                                        : "Vehicle"}{" "}
                                                    in their garage
                                                </Text>
                                            </View>
                                        }
                                        decelerationRate={"fast"}
                                        viewabilityConfig={{
                                            itemVisiblePercentThreshold: 80,
                                        }}
                                        onRefresh={() => refetchVehicle()}
                                        refreshing={isGettingVehicles}
                                        data={vehicles}
                                        keyExtractor={(item: any) =>
                                            item.id.toString()
                                        }
                                        showsVerticalScrollIndicator={false}
                                        renderItem={({ item }) => (
                                            <MyVehicle
                                                vehicleHeight={fleetHeight - 40}
                                                vehicle={item}
                                            />
                                        )}
                                    />
                                </View>
                            ) : (
                                <View
                                    style={{
                                        alignItems: "center",
                                        marginTop: 30,
                                    }}
                                >
                                    <Text style={Theme.BodyText}>
                                        User has no vehicles
                                    </Text>
                                </View>
                            )
                        ) : (
                            <View
                                style={{
                                    alignItems: "center",
                                    marginTop: 30,
                                }}
                            >
                                <Text style={Theme.BodyText}>
                                    This Profile is not public
                                </Text>
                            </View>
                        )
                    ) : (
                        <Loader />
                    )}
                </View>
            </View>
        </View>
    );
};

export default ProfileDetails;
