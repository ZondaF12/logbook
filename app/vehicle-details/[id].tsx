import {
    View,
    Text,
    useWindowDimensions,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader/Loader";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import {
    AntDesign,
    Entypo,
    Feather,
    FontAwesome,
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { Divider, Image } from "react-native-elements";
import MotSvgComponent from "@/assets/svg/MotSvg";
import TaxSvgComponent from "@/assets/svg/TaxSvg";
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeInUp,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import axios from "axios";
import { LogbookTypes } from "../new-logbook/[id]";

const VehicleDetails = () => {
    const {
        id,
        color,
        engine_size,
        images,
        make,
        model,
        mot_date,
        registered,
        registration,
        tax_date,
        insurance_date,
        service_date,
        user_id,
        year,
        description,
        mileage,
    } = useLocalSearchParams<{
        id: string;
        color: string;
        engine_size: string;
        images: any;
        make: string;
        model: string;
        mot_date: string;
        registered: string;
        registration: string;
        tax_date: string;
        insurance_date: string;
        service_date: string;
        user_id: string;
        year: string;
        description: string;
        mileage: string;
    }>();
    const router = useRouter();
    const { authState } = useAuth();

    const deviceHeight = useWindowDimensions().height;

    const getVehicleOwner = async () => {
        const { data } = await axios.get(
            `${process.env.EXPO_PUBLIC_API_URL}/api/v1/user/${user_id}`
        );

        if (data) {
            return data;
        }
    };

    const getVehicleLogs = async () => {
        if (authState?.userId === user_id) {
            const { data } = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/api/v1/log/${id}`
            );

            console.log(data);

            return data;
        }

        return [];
    };

    const {
        data: user,
        refetch: refetchOwner,
        isLoading: isLoadingOwner,
    } = useQuery({
        queryKey: ["vehicle_owner"],
        queryFn: getVehicleOwner,
    });

    const {
        data: logs,
        refetch: refetchLogs,
        isLoading: isLoadingLogs,
    } = useQuery({
        queryKey: ["vehicle_logs"],
        queryFn: getVehicleLogs,
    });

    const handleGoToProfile = () => {
        if (authState?.userId === (user?.user_id).toString()) {
            router.navigate("/(tabs)/(auth)/my-profile");
        } else {
            router.replace({
                pathname: `/profile/${user.user_id}`,
            });
        }
    };

    const handleAction = async (action: any) => {};

    if (!user || isLoadingLogs) {
        return <Loader />;
    }

    return (
        <ScrollView
            id={id}
            style={{
                width: "100%",
                // minHeight: deviceHeight * 1.5 ?? 0,
                backgroundColor: "#FFF",
                paddingBottom: 500,
            }}
        >
            <ScrollView style={{ paddingBottom: 50 }}>
                {user_id === authState?.userId && (
                    <Animated.View
                        entering={FadeInRight.springify().delay(500)}
                        style={{
                            position: "absolute",
                            zIndex: 50,
                            top: 50,
                            right: 10,
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light,
                                padding: 8,
                                borderRadius: 99,
                                opacity: 0.7,
                            }}
                            onPress={() =>
                                router.push({
                                    pathname: `/vehicle-details/settings/${id}`,
                                    params: {
                                        registration: registration,
                                    },
                                })
                            }
                        >
                            <Ionicons
                                name="settings-sharp"
                                size={28}
                                color={Colors.dark}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <ImageSwiper
                    isSwipable={JSON.parse(images).length > 1}
                    images={JSON.parse(images)}
                    height={deviceHeight * 0.5}
                />

                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        padding: 15,
                        backgroundColor: "#FFF",
                        borderEndStartRadius: 10,
                        borderEndEndRadius: 10,
                        overflow: "hidden",
                        gap: 15,
                        flex: 1,
                    }}
                >
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Animated.View
                            entering={FadeInLeft.springify().delay(200)}
                            style={{
                                display: "flex",
                                gap: 5,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={[
                                    Theme.Caption,
                                    {
                                        color: Colors.dark,
                                        fontFamily: "font-b",
                                    },
                                ]}
                            >
                                {model}
                            </Text>
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "baseline",
                                    gap: 5,
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        Theme.Caption,
                                        {
                                            color: Colors.dark,

                                            textAlign: "right",
                                        },
                                    ]}
                                >
                                    {make}
                                </Text>
                            </View>
                        </Animated.View>
                        <View>
                            <Animated.Text
                                entering={FadeInRight.springify().delay(200)}
                                style={[Theme.Title, { color: Colors.dark }]}
                            >
                                {registration}
                            </Animated.Text>
                        </View>
                    </View>

                    <Divider />

                    <Animated.View
                        entering={FadeInUp.springify().delay(200)}
                        style={{ gap: 15 }}
                    >
                        <View style={{ gap: 15 }}>
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                {user && (
                                    <TouchableOpacity
                                        onPress={handleGoToProfile}
                                        style={{
                                            flexDirection: "row",
                                            gap: 5,
                                            alignItems: "center",
                                        }}
                                    >
                                        {user?.avatar ? (
                                            <Image
                                                source={{
                                                    uri: user.avatar,
                                                }}
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                    borderRadius: 99,
                                                }}
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                    borderRadius: 99,
                                                    backgroundColor:
                                                        Colors.light,
                                                }}
                                            />
                                        )}

                                        <Text style={[Theme.Caption]}>
                                            Owned by {`@${user?.username}`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => {}}>
                                    <Feather
                                        name="share"
                                        size={25}
                                        color={Colors.grey}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                gap: 15,
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: Colors.light,
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    gap: 5,
                                    width: 115,
                                }}
                            >
                                <MaterialIcons
                                    name="access-time"
                                    size={24}
                                    color={Colors.grey}
                                />
                                <View style={{}}>
                                    <Text
                                        style={[Theme.Title, { paddingTop: 8 }]}
                                    >
                                        {year}
                                    </Text>
                                    <Text
                                        style={[
                                            Theme.ReviewText,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        Year
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: Colors.light,
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    gap: 5,
                                    width: 115,
                                }}
                            >
                                <MaterialIcons
                                    name="speed"
                                    size={24}
                                    color={Colors.grey}
                                />
                                <View style={{}}>
                                    <Text
                                        style={[Theme.Title, { paddingTop: 8 }]}
                                    >
                                        {mileage}
                                    </Text>
                                    <Text
                                        style={[
                                            Theme.ReviewText,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        Miles
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: Colors.light,
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    gap: 5,
                                    width: 115,
                                }}
                            >
                                <MaterialIcons
                                    name="electric-bolt"
                                    size={24}
                                    color={Colors.grey}
                                />
                                <View style={{}}>
                                    <Text
                                        style={[Theme.Title, { paddingTop: 8 }]}
                                    >
                                        Petrol
                                    </Text>
                                    <Text
                                        style={[
                                            Theme.ReviewText,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        Fuel type
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: Colors.light,
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    gap: 5,
                                    width: 115,
                                }}
                            >
                                <MaterialIcons
                                    name="co2"
                                    size={24}
                                    color={Colors.grey}
                                />
                                <View style={{}}>
                                    <Text
                                        style={[Theme.Title, { paddingTop: 8 }]}
                                    >
                                        229
                                    </Text>
                                    <Text
                                        style={[
                                            Theme.ReviewText,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        Emissions
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={{ paddingTop: 20 }}>
                            <Text style={[Theme.MedTitle]}>Details</Text>
                            <View style={{ paddingTop: 10 }}>
                                <View
                                    style={{
                                        paddingVertical: 15,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text
                                        style={[
                                            Theme.BodySecondary,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        Exterior Colour
                                    </Text>
                                    <Text style={[Theme.BodyText]}>
                                        {color}
                                    </Text>
                                </View>
                                <Divider />
                                <View
                                    style={{
                                        paddingVertical: 15,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text
                                        style={[
                                            Theme.BodySecondary,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        Engine Size
                                    </Text>
                                    <Text style={[Theme.BodyText]}>
                                        {engine_size}cc
                                    </Text>
                                </View>
                                <Divider />
                                <View
                                    style={{
                                        paddingVertical: 15,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text
                                        style={[
                                            Theme.BodySecondary,
                                            { color: Colors.grey },
                                        ]}
                                    >
                                        ULEZ Complient
                                    </Text>
                                    <Text style={[Theme.BodyText]}>True</Text>
                                </View>
                                <Divider />
                            </View>
                        </View>

                        <View
                            style={[
                                Theme.Container,
                                {
                                    gap: 15,
                                    paddingVertical: 20,
                                    borderRadius: 10,
                                },
                            ]}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text style={[Theme.MedTitle]}>
                                    Description
                                </Text>
                                {description &&
                                    user_id === authState?.userId && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                router.push({
                                                    pathname: `/vehicle-details/set-description/${id}`,
                                                    params: {
                                                        description:
                                                            description,
                                                    },
                                                });
                                            }}
                                        >
                                            <Feather
                                                name="edit-3"
                                                size={20}
                                                color={Colors.dark}
                                            />
                                        </TouchableOpacity>
                                    )}
                            </View>

                            <View>
                                {description ? (
                                    <Text style={Theme.BodyText}>
                                        {description}
                                    </Text>
                                ) : user_id === authState?.userId ? (
                                    <TouchableOpacity
                                        onPress={() => {
                                            router.push(
                                                `/vehicle-details/set-description/${id}`
                                            );
                                        }}
                                        style={{
                                            width: "100%",
                                            backgroundColor: Colors.secondary,
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
                                            Add Vehicle Description
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={Theme.BodyText}>
                                        No description set
                                    </Text>
                                )}
                            </View>
                        </View>

                        {user_id === authState?.userId && (
                            <View
                                style={[
                                    Theme.Container,
                                    {
                                        gap: 15,
                                        paddingVertical: 20,
                                        borderRadius: 10,
                                    },
                                ]}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text style={[Theme.MedTitle]}>
                                        Logbook
                                    </Text>
                                    {logs && logs.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                router.replace(
                                                    `/new-logbook/${id}`
                                                );
                                            }}
                                        >
                                            <Feather
                                                name="plus"
                                                size={20}
                                                color={Colors.dark}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View>
                                    {logs &&
                                    logs.length > 0 &&
                                    !isLoadingLogs ? (
                                        <>
                                            <FlashList
                                                decelerationRate={"fast"}
                                                viewabilityConfig={{
                                                    itemVisiblePercentThreshold: 80,
                                                }}
                                                // onRefresh={() => refetch()}
                                                // refreshing={isLoading}
                                                data={logs}
                                                keyExtractor={(item: any) =>
                                                    item.id.toString()
                                                }
                                                estimatedItemSize={72}
                                                showsVerticalScrollIndicator={
                                                    false
                                                }
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={{
                                                            flexDirection:
                                                                "row",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "space-between",
                                                            paddingVertical: 8,
                                                        }}
                                                        onPress={() =>
                                                            router.push(
                                                                `/logbooks/item/${item.id}`
                                                            )
                                                        }
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    "row",
                                                                alignItems:
                                                                    "center",
                                                                gap: 10,
                                                                width: "70%",
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    padding: 10,
                                                                    borderRadius: 99,
                                                                    backgroundColor:
                                                                        Colors.offgrey,
                                                                }}
                                                            >
                                                                {
                                                                    LogbookTypes[
                                                                        parseInt(
                                                                            item.category
                                                                        ) - 1
                                                                    ]?.icon
                                                                }
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        "column",
                                                                    gap: 5,
                                                                }}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        Theme.Title,
                                                                    ]}
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    {item.title}
                                                                </Text>
                                                                <Text
                                                                    style={
                                                                        Theme.ReviewText
                                                                    }
                                                                >
                                                                    {new Date(
                                                                        item.date
                                                                    ).toDateString()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View>
                                                            <Entypo
                                                                name="chevron-right"
                                                                size={20}
                                                                color={
                                                                    Colors.dark
                                                                }
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                            <View
                                                style={{
                                                    marginTop: 20,
                                                    gap: 15,
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <TouchableOpacity
                                                    onPress={() => {}}
                                                    style={{
                                                        backgroundColor:
                                                            Colors.offgrey,
                                                        height: 50,
                                                        borderRadius: 50,
                                                        flex: 1,
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontFamily:
                                                                "font-b",
                                                            fontSize: 16,
                                                            color: Colors.dark,
                                                            textAlign: "center",
                                                            lineHeight: 50,
                                                        }}
                                                    >
                                                        View All
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => {
                                                router.replace(
                                                    `/new-logbook/${id}`
                                                );
                                            }}
                                            style={{
                                                width: "100%",
                                                backgroundColor:
                                                    Colors.secondary,
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
                                                Start your car's digital Logbook
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </ScrollView>
        </ScrollView>
    );
};

export default VehicleDetails;
