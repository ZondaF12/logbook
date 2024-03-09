import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import Colors from "@/constants/Colors";
import { Divider, Image } from "react-native-elements";
import { Theme } from "@/constants/Styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import ImageSwiper from "../ImageSwiper/ImageSwiper";

interface MyVehicleProps {
    vehicle: any;
    vehicleHeight: number;
}

const MyVehicle = ({ vehicle, vehicleHeight }: MyVehicleProps) => {
    const router = useRouter();

    const bottomOffset = 15;
    const descriptionCardHeight = 75;
    const imageheight = vehicleHeight - descriptionCardHeight - bottomOffset;

    const onPressCallback = () => {
        router.push({
            pathname: `/vehicle-details/${vehicle.id}`,
            params: { ...vehicle, images: JSON.stringify(vehicle.images) },
        });
    };

    return (
        <View
            style={{
                width: "100%",
                height: vehicleHeight ?? 0,
            }}
        >
            <View
                style={{
                    display: "flex",
                    position: "relative",
                    flex: 1,
                    marginBottom: bottomOffset,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: "#FFF",
                    shadowColor: Colors.grey,
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 2.62,
                    elevation: 4,
                }}
            >
                <TouchableOpacity activeOpacity={1} onPress={onPressCallback}>
                    <ImageSwiper
                        images={vehicle.images}
                        height={imageheight}
                        onPressCallback={onPressCallback}
                        isSwipable={vehicle.images.length > 1}
                    />

                    <View
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            paddingHorizontal: 15,
                            backgroundColor: "#FFF",
                            borderEndStartRadius: 10,
                            borderEndEndRadius: 10,
                            overflow: "hidden",
                            height: descriptionCardHeight,
                        }}
                    >
                        <View
                            style={{
                                gap: 10,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    gap: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text numberOfLines={1} style={Theme.Title}>
                                    {vehicle.registration}
                                </Text>
                            </View>

                            <View
                                style={{
                                    display: "flex",
                                    gap: 5,
                                    justifyContent: "center",
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        Theme.Caption,
                                        {
                                            color: Colors.grey,
                                            fontFamily: "font-b",
                                        },
                                    ]}
                                >
                                    {vehicle.make}
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
                                                color: Colors.grey,

                                                textAlign: "right",
                                            },
                                        ]}
                                    >
                                        {vehicle.model}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MyVehicle;
