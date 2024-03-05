import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeOutLeft,
} from "react-native-reanimated";
import { Theme } from "@/constants/Styles";
import { Divider } from "react-native-elements";
import {
    Entypo,
    Feather,
    FontAwesome,
    FontAwesome5,
    FontAwesome6,
    Ionicons,
    MaterialIcons,
} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";

export const LogbookTypes = [
    {
        name: "Service",
        description:
            "Invoices & records replated to your car's scheduled services.",
        icon: <Feather name="tool" size={24} color={Colors.dark} />,
        id: 1,
    },
    {
        name: "Maintenance",
        description: "Invoices & details of all ad hoc Maintenance.",
        icon: <FontAwesome6 name="toolbox" size={24} color={Colors.dark} />,
        id: 2,
    },
    {
        name: "Restoration",
        description:
            "Photos, documentation & invoices of any restoration work.",
        icon: (
            <MaterialIcons name="auto-fix-high" size={24} color={Colors.dark} />
        ),
        id: 3,
    },
    {
        name: "Modifications",
        description:
            "Invoices & documentation of any modifications made to your car.",
        icon: <Feather name="shopping-cart" size={24} color={Colors.dark} />,
        id: 4,
    },
    {
        name: "Admin",
        description: "MOT, registration, tax & other admin related documents.",
        icon: (
            <MaterialIcons
                name="admin-panel-settings"
                size={24}
                color={Colors.dark}
            />
        ),
        id: 5,
    },
    {
        name: "Insurance",
        description:
            "Insurance policies, invoices & claims related to your car.",
        icon: <FontAwesome name="shield" size={24} color={Colors.dark} />,
        id: 6,
    },
    {
        name: "Trips & Events",
        description: "Photos, documentation & invoices of any trips or events.",
        icon: (
            <FontAwesome5
                name="suitcase-rolling"
                size={24}
                color={Colors.dark}
            />
        ),
        id: 7,
    },
    {
        name: "Warranty",
        description:
            "Warranty documents, invoices & records of your car's warranty.",
        icon: <Feather name="book" size={24} color={Colors.dark} />,
        id: 8,
    },
    {
        name: "Other",
        description: "Any other documents or records related to your car.",
        icon: <Ionicons name="key-outline" size={24} color={Colors.dark} />,
        id: 9,
    },
];

const NewLogbook = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView />

            <TouchableOpacity onPress={() => router.back()}>
                <Animated.View
                    entering={FadeInLeft.springify().delay(300)}
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
                <View style={{ gap: 15, paddingHorizontal: 15 }}>
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(200)}
                        exiting={FadeOutLeft}
                        style={Theme.Logo}
                    >
                        Add Logbook
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(200)}
                        exiting={FadeOutLeft}
                        style={Theme.BodyText}
                    >
                        Please select a type to add to your car's logbook
                    </Animated.Text>
                </View>
                <View
                    style={{
                        paddingHorizontal: 15,
                        flex: 1,
                    }}
                >
                    <Animated.View
                        entering={FadeInDown.springify().delay(200)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            overflow: "hidden",
                            flexGrow: 1,
                        }}
                    >
                        <FlashList
                            decelerationRate={"fast"}
                            viewabilityConfig={{
                                itemVisiblePercentThreshold: 80,
                            }}
                            ListFooterComponent={
                                <View
                                    style={{
                                        height: 40,
                                    }}
                                ></View>
                            }
                            ItemSeparatorComponent={() => <Divider />}
                            data={LogbookTypes}
                            estimatedItemSize={88}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        paddingVertical: 15,
                                        alignItems: "center",
                                    }}
                                    onPress={() =>
                                        router.push({
                                            pathname: `/new-logbook/add/${id}`,
                                            params: { logId: item.id },
                                        })
                                    }
                                >
                                    <View
                                        style={{
                                            backgroundColor: Colors.offgrey,
                                            padding: 15,
                                            borderRadius: 99,
                                        }}
                                    >
                                        {item.icon}
                                    </View>
                                    <View style={{ width: "70%" }}>
                                        <Text style={[Theme.Title]}>
                                            {item.name}
                                        </Text>
                                        <Text style={[Theme.ReviewText]}>
                                            {item.description}
                                        </Text>
                                    </View>
                                    <View>
                                        <Entypo
                                            name="chevron-right"
                                            size={24}
                                            color={Colors.dark}
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

export default NewLogbook;
