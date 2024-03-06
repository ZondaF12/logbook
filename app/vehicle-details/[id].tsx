import {
    View,
    Text,
    useWindowDimensions,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader/Loader";
import ImageSwiper from "@/components/ImageSwiper/ImageSwiper";
import { supabase } from "@/lib/supabase";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import {
    Entypo,
    Feather,
    FontAwesome,
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
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
import { LogbookTypes } from "../new-logbook/[id]";

const VehicleDetails = () => {
    const { id, user_id } = useLocalSearchParams<{
        id: string;
        user_id: string;
    }>();
    const router = useRouter();
    const { session } = useAuth();

    const deviceHeight = useWindowDimensions().height;

    const getVehicle = async () => {
        const { data, error } = await supabase
            .from("user_vehicles")
            .select()
            .eq("id", id);

        if (data) {
            return data[0];
        }
    };

    const getVehicleOwner = async () => {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("user_id", user_id);

        if (data) {
            return data[0];
        }
    };

    const getVehicleLogs = async () => {
        if (session?.user?.id === user_id) {
            const { data, error } = await supabase
                .from("vehicle_logs")
                .select()
                .eq("vehicle_id", id);

            if (data) {
                return data;
            }
        }

        return [];
    };

    const {
        data: vehicle,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({ queryKey: ["vehicle"], queryFn: getVehicle });

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
        if (session?.user.id === user.user_id) {
            router.navigate("/(tabs)/(auth)/my-profile");
        } else {
            router.replace({
                pathname: `/profile/${user.user_id}`,
            });
        }
    };

    const handleAction = async (action: any) => {};

    console.log(logs);

    if (vehicle?.length === 0 || !vehicle || !user || !logs) {
        return <Loader />;
    }

    return (
        <ScrollView
            id={id}
            style={{
                width: "100%",
                minHeight: deviceHeight * 1.5 ?? 0,
                backgroundColor: "#FFF",
            }}
        >
            <ScrollView style={{ paddingBottom: 550 }}>
                {user_id === session?.user?.id && (
                    <Animated.View
                        entering={FadeInRight.springify().delay(500)}
                        style={{
                            position: "absolute",
                            zIndex: 50,
                            top: 10,
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
                                router.push(`/vehicle-details/settings/${id}`)
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
                    isSwipable={vehicle?.images?.length > 1}
                    images={vehicle?.images}
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
                                {vehicle.model}
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
                                    {vehicle.make}
                                </Text>
                            </View>
                        </Animated.View>
                        <View>
                            <Animated.Text
                                entering={FadeInRight.springify().delay(200)}
                                style={[Theme.Title, { color: Colors.dark }]}
                            >
                                {vehicle.registration}
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

                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 5,
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: Colors.primary,
                                    borderRadius: 10,
                                    padding: 10,
                                    gap: 5,
                                    width: "23%",
                                    height: 70,
                                }}
                                onPress={() => handleAction("tax")}
                            >
                                <TaxSvgComponent
                                    height={25}
                                    width={25}
                                    color={Colors.light}
                                />
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.light },
                                    ]}
                                >
                                    {!isNaN(
                                        new Date(vehicle?.tax_date).getTime()
                                    )
                                        ? new Date(vehicle.tax_date) >
                                          new Date()
                                            ? "Taxed"
                                            : "Not Taxed"
                                        : vehicle?.tax_date}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: Colors.primary,
                                    borderRadius: 10,
                                    padding: 10,
                                    gap: 5,
                                    width: "23%",
                                    height: 70,
                                }}
                                onPress={() => handleAction("tax")}
                            >
                                <MotSvgComponent
                                    height={25}
                                    width={25}
                                    color={Colors.light}
                                />
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.light },
                                    ]}
                                >
                                    {new Date(vehicle.mot_date) > new Date()
                                        ? "Valid"
                                        : "Not Valid"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: Colors.primary,
                                    borderRadius: 10,
                                    padding: 10,
                                    gap: 5,
                                    width: "23%",
                                    height: 70,
                                }}
                                onPress={() => handleAction("tax")}
                            >
                                <FontAwesome
                                    name="shield"
                                    size={25}
                                    color={Colors.light}
                                />
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.light },
                                    ]}
                                >
                                    {new Date(
                                        vehicle?.insurance_date
                                    ).getTime() !== 0
                                        ? new Date(vehicle.insurance_date) >
                                          new Date()
                                            ? "Valid"
                                            : "Not Valid"
                                        : "Not Set"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: Colors.primary,
                                    borderRadius: 10,
                                    padding: 10,
                                    gap: 5,
                                    width: "23%",
                                    height: 70,
                                }}
                                onPress={() => handleAction("tax")}
                            >
                                <Feather
                                    name="tool"
                                    size={25}
                                    color={Colors.light}
                                />
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.light },
                                    ]}
                                >
                                    {new Date(
                                        vehicle?.service_date
                                    ).getTime() !== 0
                                        ? new Date(vehicle.service_date) >
                                          new Date()
                                            ? "Due"
                                            : "Not Due"
                                        : "Not Set"}
                                </Text>
                            </TouchableOpacity>
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
                            <View>
                                <Text style={[Theme.MedTitle]}>Technical</Text>
                            </View>
                            <View style={{ flexDirection: "column", gap: 10 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: Colors.primary,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: 99,
                                            padding: 8,
                                            marginRight: 10,
                                        }}
                                    >
                                        <FontAwesome5
                                            name="car"
                                            size={25}
                                            color={Colors.light}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text style={Theme.Subtitle}>Make</Text>
                                        <Text style={Theme.Caption}>
                                            {vehicle.make}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: Colors.primary,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: 99,
                                            padding: 8,
                                            marginRight: 10,
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name="calendar-month"
                                            size={25}
                                            color={Colors.light}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text style={Theme.Subtitle}>Year</Text>
                                        <Text style={Theme.Caption}>
                                            {vehicle.year}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        marginTop: 20,
                                        gap: 15,
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {}}
                                        style={{
                                            backgroundColor: Colors.offgrey,
                                            height: 50,
                                            borderRadius: 50,
                                            flex: 1,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: "font-b",
                                                fontSize: 16,
                                                color: Colors.dark,
                                                textAlign: "center",
                                                lineHeight: 50,
                                            }}
                                        >
                                            Run Check
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {}}
                                        style={{
                                            backgroundColor: Colors.offgrey,
                                            height: 50,
                                            borderRadius: 50,
                                            flex: 1,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: "font-b",
                                                fontSize: 16,
                                                color: Colors.dark,
                                                textAlign: "center",
                                                lineHeight: 50,
                                            }}
                                        >
                                            More Stats
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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
                                {vehicle?.description &&
                                    user_id === session?.user?.id && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                router.push({
                                                    pathname: `/vehicle-details/set-description/${id}`,
                                                    params: {
                                                        description:
                                                            vehicle?.description,
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
                                {vehicle?.description ? (
                                    <Text style={Theme.BodyText}>
                                        {vehicle?.description}
                                    </Text>
                                ) : user_id === session?.user?.id ? (
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

                        {user_id === session?.user?.id && (
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
                                    {logs && logs.length > 0 ? (
                                        <>
                                            <FlashList
                                                decelerationRate={"fast"}
                                                viewabilityConfig={{
                                                    itemVisiblePercentThreshold: 80,
                                                }}
                                                onRefresh={() => refetch()}
                                                refreshing={isLoading}
                                                data={logs}
                                                keyExtractor={(item) =>
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
                                                                        item.category -
                                                                            1
                                                                    ].icon
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
                    {user_id === session?.user?.id && (
                        <View
                            style={{
                                marginTop: 20,
                                gap: 15,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {}}
                                style={{
                                    backgroundColor: Colors.secondary,
                                    height: 50,
                                    borderRadius: 10,
                                    flex: 1,
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
                                    Car Handover
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {}}
                                style={{
                                    backgroundColor: Colors.secondary,
                                    height: 50,
                                    borderRadius: 10,
                                    flex: 1,
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
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScrollView>
    );
};

export default VehicleDetails;
