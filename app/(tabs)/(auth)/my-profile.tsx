import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Theme } from "@/constants/Styles";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import Colors from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";
import { Divider, Image } from "react-native-elements";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInRight,
} from "react-native-reanimated";
import Loader from "@/components/Loader/Loader";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/lib/supabase";
import { formatUserJoinedDate } from "@/utils/formatUserJoinedDate";
import { decode } from "base64-arraybuffer";

const imgDir = FileSystem.documentDirectory + "images/";

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
    }
};

const MyProfile = () => {
    const [findHeight, setFindHeight] = useState<number | undefined>(undefined);

    const { session, logout } = useAuth();

    const router = useRouter();

    const fetchUser = async () => {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("user_id", session?.user?.id);

        if (data) {
            return data[0];
        }
    };

    const {
        data: profile,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
    });

    const [images, setImages] = useState<
        { localImage: string; serverImage?: string }[]
    >([]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return <Text>{error.message}</Text>;
    }

    const uploadImage = async (uri: string) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
        });
        const filePath = `${session?.user?.id}/${new Date().getTime()}.jpeg`;

        try {
            const { data, error } = await supabase.storage
                .from("profile")
                .upload(filePath, decode(base64), {
                    contentType: "image/jpeg",
                });

            if (data) {
                const { data: url, error } = await supabase.storage
                    .from("profile")
                    .createSignedUrl(filePath, 600000000000);

                return url?.signedUrl;
            }
        } catch (error) {
            console.warn(error);
        }
    };

    const saveImage = async (uri: string, orientation: number) => {
        await ensureDirExists();

        const filename = new Date().getTime() + ".jpg";
        const dest = imgDir + filename;

        // Use the ImageManipulator from expo to correct the orientation
        const processedImage = await manipulateAsync(uri, [], {
            format: SaveFormat.JPEG,
            compress: 1,
            base64: false,
        });

        await FileSystem.copyAsync({ from: processedImage.uri, to: dest });
        return dest;
    };

    const selectImages = async (useLibrary: boolean) => {
        let result;

        if (useLibrary) {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
        } else {
            await ImagePicker.requestCameraPermissionsAsync();

            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
        }

        if (!result.canceled) {
            const savedImages = await Promise.all(
                result.assets.map(async (asset) => {
                    const savedImage = await saveImage(
                        asset.uri,
                        asset?.exif?.Orientation
                    );
                    return savedImage;
                })
            );

            setImages((prevImages) => [
                ...savedImages.map((image) => ({ localImage: image })),
            ]);

            const uploadedImages = await Promise.all(
                savedImages.map(async (savedImage) => {
                    return await uploadImage(savedImage);
                })
            );

            const image_urls: string[] = [];

            for (const item of uploadedImages) {
                image_urls.push(item!);
            }

            const updatedImages = savedImages.map((savedImage, index) => ({
                localImage: savedImage,
                serverImage: image_urls[index],
            }));

            await supabase
                .from("users")
                .update({ avatar: image_urls[0] })
                .eq("id", profile.id);

            setImages((prevImages) => [
                ...prevImages.filter((image) => image.serverImage != null),
                ...updatedImages,
            ]);
        }
    };

    return (
        <View style={{ flex: 1, gap: 15 }}>
            <SafeAreaView />
            <StatusBar style="dark" />

            <View style={{ paddingHorizontal: 15, gap: 15, marginTop: 5 }}>
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Animated.Text
                        entering={FadeInLeft.springify()}
                        style={Theme.BigTitle}
                    >
                        @{profile?.username}
                    </Animated.Text>
                    <Animated.View entering={FadeInRight.springify()}>
                        <TouchableOpacity
                            onPress={() => logout()}
                            style={{
                                borderColor: Colors.grey,
                                borderWidth: 1,
                                paddingHorizontal: 15,
                                paddingVertical: 10,
                                gap: 5,
                                borderRadius: 99,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={[Theme.Caption, { color: Colors.grey }]}
                            >
                                Sign out
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <View
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 15,
                    }}
                >
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => selectImages(true)}
                            style={{
                                width: 70,
                                height: 70,
                                borderColor: Colors.grey,
                                borderRadius: 99,
                                borderWidth: 1,
                                // borderWidth: session?.profile?.avatar ? 0 : 1,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="pencil-circle"
                                size={24}
                                color="black"
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    zIndex: 10,
                                    right: 0,
                                }}
                            />

                            {images[0] ? (
                                <>
                                    <Image
                                        source={{ uri: images[0].localImage }}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 99,
                                        }}
                                    />
                                    {!images[0].serverImage && (
                                        <View
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                backgroundColor:
                                                    "rgba(255, 255, 255, 0.483)", // Adjust the background color and opacity as needed
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: 99,
                                            }}
                                        >
                                            <ActivityIndicator
                                                size="small"
                                                color={Colors.light}
                                            />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <Image
                                    source={{ uri: profile?.avatar }}
                                    style={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: 99,
                                    }}
                                />
                            )}
                        </TouchableOpacity>

                        <View
                            style={{
                                flex: 1,
                                position: "relative",
                                gap: 5,
                            }}
                        >
                            <Text style={Theme.Title}>{profile.name}</Text>

                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.dark },
                                    ]}
                                >
                                    4 Vehicles
                                </Text>
                                <Text
                                    style={[
                                        Theme.BodyText,
                                        { color: Colors.dark },
                                    ]}
                                >
                                    Joined{" "}
                                    {formatUserJoinedDate(profile.created_at)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {profile?.bio ? (
                        <Text style={[Theme.BodyText, { color: Colors.grey }]}>
                            {profile.bio}
                        </Text>
                    ) : (
                        <Text style={[Theme.BodyText, { color: Colors.grey }]}>
                            ahhhhh
                        </Text>
                    )}
                </View>

                <Animated.View
                    entering={FadeInDown.springify().delay(50)}
                    style={{
                        justifyContent: "space-between",
                        flexDirection: "row",
                        gap: 15,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            borderColor: Colors.grey,
                            borderWidth: 1,
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            gap: 5,
                            flex: 1,
                            borderRadius: 99,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() =>
                            router.push({
                                pathname: `/edit-profile/${profile.id}`,
                                params: {
                                    firstname: profile.name,
                                    bio: profile.bio,
                                    public: profile.public,
                                },
                            })
                        }
                    >
                        <Text
                            style={[Theme.ButtonText, { color: Colors.grey }]}
                        >
                            Edit profile
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.dark,
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            gap: 5,
                            flex: 1,
                            borderRadius: 99,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={[Theme.ButtonText, { color: Colors.light }]}
                        >
                            Share profile
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View
                style={{
                    flex: 1,
                    paddingVertical: 15,
                }}
            >
                <Animated.View
                    entering={FadeInLeft.delay(50)}
                    style={{
                        flex: 1,
                        gap: 15,
                    }}
                >
                    <View style={{ gap: 15 }}>
                        <Text style={[Theme.Title, { paddingHorizontal: 15 }]}>
                            Account
                        </Text>
                        <TouchableOpacity style={{ gap: 15 }}>
                            <Text
                                style={[
                                    Theme.BodyText,
                                    { paddingHorizontal: 15 },
                                ]}
                            >
                                Login with Face ID
                            </Text>
                            <Divider />
                        </TouchableOpacity>
                    </View>
                    <View style={{ gap: 15 }}>
                        <Text style={[Theme.Title, { paddingHorizontal: 15 }]}>
                            Legal
                        </Text>
                        <TouchableOpacity style={{ gap: 15 }}>
                            <Text
                                style={[
                                    Theme.BodyText,
                                    { paddingHorizontal: 15 },
                                ]}
                            >
                                Terms and Conditions
                            </Text>
                            <Divider />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ gap: 15 }}>
                            <Text
                                style={[
                                    Theme.BodyText,
                                    { paddingHorizontal: 15 },
                                ]}
                            >
                                Privacy Policy
                            </Text>
                            <Divider />
                        </TouchableOpacity>
                    </View>
                    <View style={{ gap: 15 }}>
                        <Text style={[Theme.Title, { paddingHorizontal: 15 }]}>
                            Find Us
                        </Text>
                        <View
                            style={{
                                paddingHorizontal: 15,
                                display: "flex",
                                flexDirection: "row",
                                gap: 5,
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.grey,
                                    borderRadius: 10,
                                    padding: 20,
                                    width: "30%",
                                    alignItems: "center",
                                }}
                            >
                                <FontAwesome6
                                    name="instagram"
                                    size={25}
                                    color={Colors.light}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.grey,
                                    borderRadius: 10,
                                    padding: 20,
                                    width: "30%",
                                    alignItems: "center",
                                }}
                            >
                                <FontAwesome6
                                    name="x-twitter"
                                    size={25}
                                    color={Colors.light}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.grey,
                                    borderRadius: 10,
                                    padding: 20,
                                    width: "30%",
                                    alignItems: "center",
                                }}
                            >
                                <FontAwesome6
                                    name="facebook"
                                    size={25}
                                    color={Colors.light}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 15, marginTop: 15 }}>
                        <Text>Version 0.9.1</Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

export default MyProfile;
