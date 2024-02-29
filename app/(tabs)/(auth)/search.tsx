import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Keyboard,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeInUp,
    FadeOutRight,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { StatusBar } from "expo-status-bar";
import { Theme } from "@/constants/Styles";
import { FlashList } from "@shopify/flash-list";
import { Divider } from "react-native-elements";
import { useQuery } from "@tanstack/react-query";
import { Marquee } from "@animatereactnative/marquee";

const Search = () => {
    return (
        <>
            <SafeAreaView style={{ backgroundColor: "#FFF" }} />
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
                {/* <Animated.View entering={FadeInUp.springify().delay(600)}>
                    <Marquee speed={0.5} spacing={10}>
                        <Text style={[Theme.BigTitle, { letterSpacing: 30 }]}>
                            🍔🍟🍕🌭🥪🌮🌯🥙🥚🥓🥩🍖🍗🍤🍣🍱🍛🍝🍜🍲🍥🍙🍚🍘🍢🍡🥟🥠🥮🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯☕🍵🍾🍷🍸🍹🍺🍻🥂🥃🥤🧃🧉
                        </Text>
                    </Marquee>
                </Animated.View> */}

                <View style={{ paddingHorizontal: 15, gap: 5, paddingTop: 15 }}>
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(100)}
                        style={Theme.BigTitle}
                    >
                        Looking for something?
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(300)}
                        style={Theme.BodyText}
                    >
                        Search the registration or account below to find out
                        more
                    </Animated.Text>
                </View>
                <SearchComponent />
            </View>
        </>
    );
};

const SearchComponent = () => {
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [query, setQuery] = useState<string>("");

    const router = useRouter();
    const { session } = useAuth();

    // const { data, isLoading, isError, error, refetch } = useQuery(
    //     searchQuery.searchControllerSearch(query)
    // );

    // // Combine profiles and places into a single array
    // const combinedData = [...(data?.profiles ?? []), ...(data?.places ?? [])];

    // const handleGoToProfile = (userId: string) => {
    //     if (session) {
    //         session.profile.id === userId
    //             ? router.push("/(tabs)/(auth)/my-profile")
    //             : router.push(`/profile/${userId}`);
    //     } else {
    //         router.push(`/profile/${userId}`);
    //     }
    // };

    return (
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
                        <Ionicons name="search" size={20} color={Colors.grey} />
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
                        <Ionicons name="search" size={20} color={Colors.grey} />
                        <Text style={[Theme.BodyText, { color: Colors.grey }]}>
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
                // data={combinedData}
                ItemSeparatorComponent={() => <Divider />}
                onScroll={Keyboard.dismiss}
                renderItem={({ item }) => {
                    return <View></View>;
                }}
            />
        </View>
    );
};

export default Search;
