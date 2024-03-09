import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import * as FileSystem from "expo-file-system";
import Colors from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeOutRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/Styles";
import { supabase } from "@/lib/supabase";

const VehicleSettings = () => {
    const { id, registration } = useLocalSearchParams<{
        id: string;
        registration: string;
    }>();
    const router = useRouter();
    const { session } = useAuth();

    const handleDeleteVehicle = async () => {
        Alert.alert(
            "Delete Vehicle",
            "Are you sure you want to delete this vehicle?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => deleteVehicle(),
                    style: "destructive",
                },
            ],
            { cancelable: false }
        );
    };

    const deleteVehicle = async () => {
        /* Delete Vehicle from user_vehicles table */
        const { data, error } = await supabase
            .from("user_vehicles")
            .delete()
            .eq("id", id);

        /* Delete logs related to vehicle from vehicle_logs table */
        const { data: vehicleData, error: vehicleError } = await supabase
            .from("vehicle_logs")
            .delete()
            .eq("vehicle_id", id);

        /* Get Each of the images related to the vehicle */
        const { data: vehicleImageList, error: storageImageListError } =
            await supabase.storage
                .from("vehicleimages")
                .list(`${session?.user?.id}/${registration}`);

        /* If the list isn't empty repeat through each and delete them */
        if (vehicleImageList && vehicleImageList.length > 0) {
            const filesToRemove = vehicleImageList.map(
                (x: any) => `${session?.user?.id}/${registration}/${x.name}`
            );

            const { error: storageDeleteError } = await supabase.storage
                .from("vehicleimages")
                .remove(filesToRemove);
        }

        /* Get each of the logbook files related to the vehicle */
        const { data: vehicleLogFilesList, error: storageLogFilesListError } =
            await supabase.storage
                .from("vehiclelogbooks")
                .list(`${session?.user?.id}/${id}/files`);

        /* If files exist then repeat through each of them and delete */
        if (vehicleLogFilesList && vehicleLogFilesList.length > 0) {
            const filesToRemove = vehicleLogFilesList.map(
                (x: any) => `${session?.user?.id}/${registration}/${x.name}`
            );

            const { error: storageDeleteError } = await supabase.storage
                .from("vehiclelogbooks")
                .remove(filesToRemove);
        }

        /* Get each of the logbook images related to the vehicle */
        const { data: vehicleLogImagesList, error: storageLogImagesListError } =
            await supabase.storage
                .from("vehiclelogbooks")
                .list(`${session?.user?.id}/${id}/images`);

        /* If images exist then repeat through each of them and delete */
        if (vehicleLogImagesList && vehicleLogImagesList.length > 0) {
            const filesToRemove = vehicleLogImagesList.map(
                (x: any) => `${session?.user?.id}/${registration}/${x.name}`
            );

            const { error: storageDeleteError } = await supabase.storage
                .from("vehiclelogbooks")
                .remove(filesToRemove);
        }

        if (
            error ||
            vehicleError ||
            storageImageListError ||
            storageLogFilesListError ||
            storageLogImagesListError
        ) {
            Alert.alert("Error", "There was an error deleting the vehicle");
        } else {
            router.push({
                pathname: "/",
            });
        }
    };

    return (
        <>
            <SafeAreaView
                style={{
                    backgroundColor: "#FFF",
                    height: "100%",
                }}
                edges={["top", "left", "right"]}
            >
                <StatusBar style="dark" />
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        marginTop: 15,
                        marginBottom: 5,
                    }}
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Animated.View
                            entering={FadeInLeft.springify().delay(800)}
                            exiting={FadeOutRight}
                            style={{
                                borderRadius: 99,
                                overflow: "hidden",
                                bottom: 0,
                                left: 0,
                            }}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={30}
                                color="black"
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        paddingHorizontal: 15,
                        paddingTop: 15,
                    }}
                >
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(500)}
                        style={[
                            Theme.BigTitle,
                            {
                                marginBottom: 15,
                            },
                        ]}
                    >
                        Settings
                    </Animated.Text>
                    <Animated.View
                        entering={FadeInDown.springify().delay(500)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 15,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: `/vehicle-details/settings/handover/${id}`,
                                    params: { registration },
                                })
                            }
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
                                Handover
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDeleteVehicle}
                            style={{
                                width: "100%",
                                backgroundColor: "red",
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
                                Delete Vehicle
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </>
    );
};

export default VehicleSettings;
