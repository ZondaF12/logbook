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
import { supabase } from "@/lib/supabase";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import {
    Feather,
    FontAwesome,
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
    Octicons,
} from "@expo/vector-icons";
import { Divider } from "react-native-elements";
import MotSvgComponent from "@/assets/svg/MotSvg";
import TaxSvgComponent from "@/assets/svg/TaxSvg";
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeInUp,
} from "react-native-reanimated";

const VehicleDetails = () => {
    const { id } = useLocalSearchParams<{ id: string; data: string }>();
    const router = useRouter();
    const { session } = useAuth();

    const deviceHeight = useWindowDimensions().height;

    const getVehicle = async () => {
        const { data, error } = await supabase
            .from("user_vehicles")
            .select()
            .eq("id", id);

        return data;
    };

    const getSelf = async () => {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("user_id", session?.user?.id);

        return data;
    };

    const {
        data: vehicle,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({ queryKey: ["vehicle"], queryFn: getVehicle });

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: getSelf,
    });

    const handleGoToProfile = () => {
        // if (session) {
        //     session.profile.id === find?.user.id
        //         ? router.replace("/(tabs)/(auth)/my-profile")
        //         : router.replace(`/profile/${find?.user.id}`);
        // } else {
        //     router.replace(`/profile/${find?.user.id}`);
        // }
    };

    const handleAction = async (action: any) => {};

    if (vehicle?.length === 0 || !vehicle || !user) {
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
                <ImageSwiper
                    isSwipable={vehicle[0]?.images?.length > 1}
                    images={vehicle[0]?.images}
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
                                {vehicle[0].model}
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
                                    {vehicle[0].make}
                                </Text>
                            </View>
                        </Animated.View>
                        <Animated.Text
                            entering={FadeInRight.springify().delay(200)}
                            style={[Theme.Title, { color: Colors.dark }]}
                        >
                            {vehicle[0].registration}
                        </Animated.Text>
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
                                        <View
                                            style={{
                                                width: 35,
                                                height: 35,
                                                borderRadius: 99,
                                                backgroundColor: Colors.light,
                                            }}
                                        />

                                        <Text style={[Theme.Caption]}>
                                            Owned by {`@${user[0]?.username}`}
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
                                        new Date(vehicle[0]?.tax_date).getTime()
                                    )
                                        ? new Date(vehicle[0].tax_date) >
                                          new Date()
                                            ? "Taxed"
                                            : "Not Taxed"
                                        : vehicle[0]?.tax_date}
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
                                    {new Date(vehicle[0].mot_date) > new Date()
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
                                        vehicle[0]?.insurance_date
                                    ).getTime() !== 0
                                        ? new Date(vehicle[0].insurance_date) >
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
                                        vehicle[0]?.service_date
                                    ).getTime() !== 0
                                        ? new Date(vehicle[0].service_date) >
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
                                    paddingVertical: 15,
                                    borderRadius: 10,
                                },
                            ]}
                        >
                            <View>
                                <Text style={[Theme.BigTitle]}>Technical</Text>
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
                                            {vehicle[0].make}
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
                                            {vehicle[0].year}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View
                            style={[
                                Theme.Container,
                                {
                                    gap: 15,
                                    paddingVertical: 15,
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
                                <Text style={[Theme.BigTitle]}>
                                    Description
                                </Text>
                                {vehicle[0]?.description && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            router.push({
                                                pathname: `/vehicle-details/set-description/${id}`,
                                                params: {
                                                    description:
                                                        vehicle[0]?.description,
                                                },
                                            });
                                        }}
                                    >
                                        <Feather
                                            name="edit-3"
                                            size={25}
                                            color={Colors.dark}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View>
                                {vehicle[0]?.description ? (
                                    <Text style={Theme.BodyText}>
                                        {vehicle[0]?.description}
                                    </Text>
                                ) : (
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
                                )}
                            </View>
                        </View>

                        <View
                            style={[
                                Theme.Container,
                                {
                                    gap: 15,
                                    paddingVertical: 15,
                                    borderRadius: 10,
                                },
                            ]}
                        >
                            <View>
                                <Text style={[Theme.BigTitle]}>
                                    History File
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

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
                </View>
            </ScrollView>
        </ScrollView>
    );
};

export default VehicleDetails;
