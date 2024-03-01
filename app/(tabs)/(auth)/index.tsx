import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader/Loader";

const index = () => {
    const { session } = useAuth();

    const fetchUserVehicle = async () => {
        const { data, error } = await supabase
            .from("user_vehicles")
            .select()
            .eq("user_id", session?.user?.id);

        return data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["user_vehicles"],
        queryFn: fetchUserVehicle,
    });

    if (isLoading) {
        return <Loader />;
    }

    return (
        <SafeAreaView>
            <View
                style={{
                    paddingHorizontal: 15,
                    gap: 5,
                    paddingTop: 15,
                }}
            >
                {data ? (
                    <View></View>
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
        </SafeAreaView>
    );
};

export default index;
