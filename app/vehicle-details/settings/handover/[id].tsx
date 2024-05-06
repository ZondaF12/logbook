import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Keyboard,
    Alert,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeOutRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Divider } from "react-native-elements";
import ProfileSearchResult from "@/components/Search/ProfileSearchResult";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const HandoverVehicle = () => {
    const { id, registration } = useLocalSearchParams<{
        id: string;
        registration: string;
    }>();

    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isHandingOver, setIsHandingOver] = useState<boolean>(false);
    const [transferTo, setTransferTo] = useState<string>("");

    const [query, setQuery] = useState<string>("");

    const router = useRouter();
    const { session } = useAuth();

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from("users")
            .select()
            .textSearch("username", `${query.toLowerCase()}:*`);

        if (data) {
            return data;
        } else {
            return [];
        }
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["search_for_users"],
        queryFn: fetchUsers,
    });

    useEffect(() => {
        refetch();
    }, [query]);

    const handoverVehicle = async (userId: string, username: string) => {
        Alert.alert(
            "Handover Vehicle",
            `Are you sure you want to transfer this vehicle to ${username}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Transfer",
                    onPress: () => {
                        setTransferTo(username);
                        handleHandoverVehicle(userId);
                    },
                    style: "destructive",
                },
            ],
            { cancelable: false }
        );
    };

    const handleHandoverVehicle = async (userId: string) => {
        if (session?.user.id === userId) {
            return;
        }

        setIsHandingOver(true);
        /* Update the user_vehicle to be new users id */
        const { data, error } = await supabase
            .from("user_vehicles")
            .update({ user_id: userId })
            .eq("id", id);

        /* Update any of the vehicles logs to be new users id */
        const { data: vehicleData, error: vehicleError } = await supabase
            .from("vehicle_logs")
            .update({ user_id: userId })
            .eq("vehicle_id", id);

        /* Move the images from the old user to the new user */
        const { data: vehicleList, error: storageListError } =
            await supabase.storage
                .from("vehicleimages")
                .list(`${session?.user?.id}/${registration}`);

        if (vehicleList && vehicleList.length > 0) {
            const filesToMove = vehicleList.map((x: any) => [
                `${session?.user?.id}/${registration}/${x.name}`,
                `${userId}/${registration}/${x.name}`,
            ]);

            for (let i = 0; i < filesToMove.length; i++) {
                const { error: storageDeleteError } = await supabase.storage
                    .from("vehicleimages")
                    .move(filesToMove[i][0], filesToMove[i][1]);
            }
        }

        /* Move the logbook files from the old user to the new user */
        const { data: vehicleStorageFileList, error: storageFileListError } =
            await supabase.storage
                .from("vehiclelogbooks")
                .list(`${session?.user?.id}/${id}/files`);

        if (vehicleStorageFileList && vehicleStorageFileList.length > 0) {
            const filesToMove = vehicleStorageFileList.map((x: any) => [
                `${session?.user?.id}/${id}/files/${x.name}`,
                `${userId}/${id}/files/${x.name}`,
            ]);

            for (let i = 0; i < filesToMove.length; i++) {
                const { error: storageDeleteError } = await supabase.storage
                    .from("vehiclelogbooks")
                    .move(filesToMove[i][0], filesToMove[i][1]);
            }
        }

        /* Move the logbook images from the old user to the new user */
        const { data: vehicleStorageImageList, error: storageImageListError } =
            await supabase.storage
                .from("vehiclelogbooks")
                .list(`${session?.user?.id}/${id}/images`);

        if (vehicleStorageImageList && vehicleStorageImageList.length > 0) {
            const filesToMove = vehicleStorageImageList.map((x: any) => [
                `${session?.user?.id}/${id}/images/${x.name}`,
                `${userId}/${id}/images/${x.name}`,
            ]);

            for (let i = 0; i < filesToMove.length; i++) {
                const { error: storageDeleteError } = await supabase.storage
                    .from("vehiclelogbooks")
                    .move(filesToMove[i][0], filesToMove[i][1]);
            }
        }

        setIsHandingOver(false);
        if (
            error ||
            vehicleError ||
            storageListError ||
            storageFileListError ||
            storageImageListError
        ) {
            Alert.alert("Error", "There was an error handing over the vehicle");
        } else {
            router.push({
                pathname: "/",
            });
        }
    };

    if (isHandingOver) {
        return (
            <SafeAreaView
                style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    gap: 15,
                }}
            >
                <Text style={[Theme.Subtitle]}>
                    Transferring the vehicle to @{transferTo}
                </Text>
                <Animated.View>
                    <ActivityIndicator />
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <SafeAreaView style={{ backgroundColor: "#FFF" }} />
            <View
                style={{
                    backgroundColor: "#FFF",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 15,
                    paddingTop: 15,
                    paddingBottom: 5,
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
                        <Ionicons name="arrow-back" size={30} color="black" />
                    </Animated.View>
                </TouchableOpacity>
            </View>
            <StatusBar style="dark" />
            <View
                style={[
                    Theme.Container,
                    {
                        paddingTop: 15,
                        paddingHorizontal: 0,
                        backgroundColor: "#FFF",
                    },
                ]}
            >
                <View style={{ paddingHorizontal: 15, gap: 5, paddingTop: 15 }}>
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(100)}
                        style={Theme.BigTitle}
                    >
                        Handover Vehicle
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(300)}
                        style={Theme.BodyText}
                    >
                        Search for the user you wish to handover the vehicle to
                    </Animated.Text>
                </View>
                <View style={[Theme.Container, { backgroundColor: "#FFF" }]}>
                    <SafeAreaView />
                    <StatusBar style="dark" />

                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 15,
                            marginTop: 15,
                        }}
                    >
                        {isSearching ? (
                            <View
                                style={{
                                    width: 200,
                                    backgroundColor: Colors.light,
                                    padding: 10,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                    flex: 1,
                                }}
                            >
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color={Colors.grey}
                                />
                                <TextInput
                                    onChangeText={(e) => setQuery(e)}
                                    placeholder="Search users & registrations"
                                    placeholderTextColor={Colors.grey}
                                    autoFocus={true}
                                    autoComplete="off"
                                    spellCheck={false}
                                    autoCorrect={false}
                                    focusable={isSearching}
                                    style={[
                                        Theme.BodyText,
                                        {
                                            color: Colors.dark,
                                            paddingBottom: 5,
                                        },
                                    ]}
                                />
                            </View>
                        ) : (
                            <Animated.View
                                entering={FadeInLeft}
                                exiting={FadeOutRight}
                                onTouchStart={() => setIsSearching(true)}
                                style={{
                                    width: 400,
                                    backgroundColor: Colors.light,
                                    padding: 10,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                    flex: 1,
                                    paddingVertical: 13.5,
                                }}
                            >
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color={Colors.grey}
                                />
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.grey },
                                    ]}
                                >
                                    Search users & registrations
                                </Text>
                            </Animated.View>
                        )}

                        {isSearching && (
                            <TouchableOpacity
                                onPress={() => {
                                    setIsSearching(false);
                                    setQuery("");
                                }}
                            >
                                <Animated.Text
                                    entering={FadeInRight}
                                    exiting={FadeOutRight}
                                    style={Theme.BodyText}
                                >
                                    Cancel
                                </Animated.Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlashList
                        keyboardShouldPersistTaps="handled"
                        estimatedItemSize={25}
                        data={data}
                        ItemSeparatorComponent={() => <Divider />}
                        onScroll={Keyboard.dismiss}
                        renderItem={({ item }: any) => (
                            <TouchableOpacity
                                onPress={() =>
                                    handoverVehicle(item.user_id, item.username)
                                }
                            >
                                <ProfileSearchResult
                                    profile={{
                                        id: item.id,
                                        name: item.name,
                                        username: item.username,
                                        avatar: item.avatar,
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </>
    );
};

export default HandoverVehicle;
