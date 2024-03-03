import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    LayoutAnimation,
} from "react-native";
import React, { useState } from "react";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader/Loader";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";
import MyVehicle from "@/components/Garage/MyVehicle";

const index = () => {
    const [fleetHeight, setFleetHeight] = useState<number | undefined>(
        undefined
    );

    const { session } = useAuth();

    const fetchUserVehicle = async () => {
        const { data, error } = await supabase
            .from("user_vehicles")
            .select()
            .eq("user_id", session?.user?.id);

        return data;
    };

    const { data, isLoading, error, isError, refetch } = useQuery({
        queryKey: ["user_vehicles"],
        queryFn: fetchUserVehicle,
    });

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return <Text style={{ paddingTop: 100 }}>{error.message}</Text>;
    }

    return (
        <View style={{ flex: 1, gap: 15 }}>
            <SafeAreaView />
            <StatusBar style="dark" />

            <View
                style={{
                    paddingHorizontal: 15,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Animated.Text
                    entering={FadeInLeft.springify()}
                    exiting={FadeOutLeft}
                    style={Theme.Logo}
                >
                    my garage
                </Animated.Text>
            </View>

            <View
                style={Theme.Container}
                onLayout={(e) => {
                    if (fleetHeight) {
                        e.nativeEvent.layout.height < fleetHeight &&
                            setFleetHeight(e.nativeEvent.layout.height / 2.5);
                    } else {
                        LayoutAnimation.configureNext(
                            LayoutAnimation.Presets.easeInEaseOut
                        );
                        setFleetHeight(e.nativeEvent.layout.height / 2.5);
                    }
                }}
            >
                {data && data?.length > 0 ? (
                    <View
                        style={{
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            overflow: "hidden",
                            flexGrow: 1,
                        }}
                    >
                        <FlashList
                            ListFooterComponent={
                                <View
                                    style={{
                                        height: 40,
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
                                        {data.length}{" "}
                                        {data.length > 1
                                            ? "Vehicles"
                                            : "Vehicle"}{" "}
                                        in your garage
                                    </Text>
                                </View>
                            }
                            decelerationRate={"fast"}
                            viewabilityConfig={{
                                itemVisiblePercentThreshold: 80,
                            }}
                            onRefresh={() => refetch()}
                            refreshing={isLoading}
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <MyVehicle
                                    vehicle={item}
                                    vehicleHeight={fleetHeight! - 40}
                                />
                            )}
                        />
                    </View>
                ) : (
                    <View
                        style={{
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Animated.View
                            entering={FadeInLeft.springify().delay(100)}
                            style={{
                                gap: 5,
                                backgroundColor: "#FFF",
                                borderRadius: 10,
                                padding: 15,
                            }}
                        >
                            <Text style={Theme.Subtitle}>
                                Add your first vehicle
                            </Text>
                            <Text style={Theme.ReviewText}>
                                Lorem, ipsum dolor sit amet consectetur
                                adipisicing elit. Officia libero harum non
                                reiciendis hic, earum tempore
                            </Text>
                        </Animated.View>
                        <TouchableOpacity
                            onPress={() => {
                                router.push("/new-vehicle/registration");
                            }}
                            style={{
                                width: "100%",
                                backgroundColor: Colors.primary,
                                height: 50,
                                borderRadius: 10,
                                marginTop: 15,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "font-b",
                                    fontSize: 16,
                                    color: Colors.light,
                                    textAlign: "center",
                                    lineHeight: 50,
                                }}
                            >
                                Let's get started
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default index;
