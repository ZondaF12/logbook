import {
    View,
    Text,
    useWindowDimensions,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Colors from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeOutRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/Styles";
import { Button, Image } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getVehicleDetails } from "@/api/getVehicleData";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

const imgDir = FileSystem.documentDirectory + "images/";

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
    }
};

const NewVehicle = () => {
    const {
        id,
        model,
        make,
        year,
        engineSize,
        color,
        registered,
        taxDate,
        motDate,
    } = useLocalSearchParams<{
        id: string;
        model: string;
        make: string;
        year: string;
        engineSize: string;
        color: string;
        registered: string;
        taxDate: string;
        motDate: string;
    }>();
    const { session } = useAuth();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vehicleData, setVehicleData] = useState<any>();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [images, setImages] = useState<
        { localImage: string; serverImage?: string }[]
    >([]);

    const uploadImage = async (uri: string) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
        });
        const filePath = `${
            session?.user?.id
        }/${id}/${new Date().getTime()}.jpeg`;

        try {
            const { data, error } = await supabase.storage
                .from("vehicleimages")
                .upload(filePath, decode(base64), {
                    contentType: "image/jpeg",
                });

            if (data) {
                const { data: url, error } = await supabase.storage
                    .from("vehicleimages")
                    .createSignedUrl(filePath, 600000000000);

                return url?.signedUrl;
            }
        } catch (error) {
            console.warn(error);
        }
    };

    const saveImage = async (uri: string, orientation: number) => {
        await ensureDirExists();

        const randomId = Math.floor(Math.random() * 10000); // Generate random number between 0 and 9999
        const filename = `${new Date().getTime()}_${randomId}.jpg`; // Combine timestamp and random number for uniqueness
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
                allowsMultipleSelection: true,
            });
        } else {
            await ImagePicker.requestCameraPermissionsAsync();
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
        }
        if (!result.canceled) {
            setIsUploading(true);
            const savedImages = await Promise.all(
                result.assets.map(async (asset) => {
                    const savedImage = await saveImage(
                        asset.uri,
                        asset?.exif?.Orientation
                    );
                    return savedImage;
                })
            );
            setImages((prevImages: any) => [
                ...prevImages,
                ...savedImages.map((image) => ({ localImage: image })),
            ]);
            const uploadedImages = await Promise.all(
                savedImages.map(async (savedImage: any) => {
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
            setImages((prevImages: any) => [
                ...prevImages.filter((image: any) => image.serverImage != null),
                ...updatedImages,
            ]);

            setIsUploading(false);
        }
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        clearErrors,
        setValue,
    } = useForm<any>({
        defaultValues: {
            model: model || null,
        },
    });

    useEffect(() => {
        setValue(
            "images",
            images.map((image) => image.serverImage || "")
        );
    }, [images]);

    const dimensions = useWindowDimensions();

    const onSubmit: SubmitHandler<any> = async (values) => {
        console.log(values.images[0]);

        const newVehicle = {
            registration: id,
            model: values.model,
            nickname: values.nickname,
            description: values.description,
            images: values.images,
            make,
            year,
            engine_size: engineSize,
            color,
            registered,
            tax_date: taxDate,
            mot_date: motDate,
        };

        const { error } = await supabase
            .from("user_vehicles")
            .insert(newVehicle);

        if (!error) {
            router.navigate("/");
        }
    };

    return (
        <>
            <SafeAreaView
                style={{ backgroundColor: "#FFF" }}
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

                    <Animated.Text
                        entering={FadeInRight.springify().delay(300)}
                        exiting={FadeOutRight}
                        style={[Theme.Title]}
                    >
                        {id}
                    </Animated.Text>
                </View>
            </SafeAreaView>

            <KeyboardAwareScrollView extraHeight={200}>
                <ScrollView
                    style={{
                        backgroundColor: "#FFF",
                        paddingHorizontal: 15,
                        flex: 1,
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
                        Add Vehicle
                    </Animated.Text>
                    <Animated.View
                        entering={FadeInDown.springify().delay(1000)}
                        style={{
                            flex: 1,
                            display: "flex",
                            gap: 15,
                        }}
                    >
                        <Controller
                            name="images"
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <ScrollView
                                    style={{ height: 250 }}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <TouchableOpacity
                                        onPress={() => selectImages(true)}
                                        style={{
                                            width:
                                                images && images?.length > 0
                                                    ? 150
                                                    : dimensions.width - 30,
                                            height: "100%",
                                            backgroundColor: Colors.light,
                                            borderRadius: 10,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 10,
                                        }}
                                    >
                                        <Ionicons
                                            name="images-outline"
                                            size={24}
                                            color={Colors.grey}
                                        />
                                    </TouchableOpacity>

                                    {images &&
                                        images.map((image, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    marginRight: 10,
                                                    position: "relative",
                                                    alignItems: "center", // Center horizontally
                                                    justifyContent: "center", // Center vertically
                                                }}
                                            >
                                                <Image
                                                    source={{
                                                        uri: image.localImage,
                                                    }}
                                                    style={{
                                                        width: 150,
                                                        flex: 1,
                                                        borderRadius: 10,
                                                    }}
                                                />
                                                {!image.serverImage && (
                                                    <View
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: 0,
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            backgroundColor:
                                                                "rgba(255, 255, 255, 0.483)", // Adjust the background color and opacity as needed
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >
                                                        <ActivityIndicator
                                                            size="large"
                                                            color="#FFF"
                                                        />
                                                    </View>
                                                )}
                                                <TouchableOpacity
                                                    style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        right: 0,
                                                        zIndex: 99,
                                                    }}
                                                    onPress={() => {
                                                        setImages(
                                                            (prevImages) =>
                                                                prevImages.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index
                                                                )
                                                        );
                                                    }}
                                                >
                                                    <Ionicons
                                                        name="remove-circle"
                                                        size={24}
                                                        color={"red"}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </ScrollView>
                            )}
                        />

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Nickname</Text>
                            <Text style={Theme.Caption}>
                                Vehicle nickname (optional)
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"Nickname"}
                                    style={[
                                        Theme.InputStyle,
                                        {
                                            backgroundColor: "#FFF",
                                            borderWidth: 1,
                                        },
                                        errors.nickname
                                            ? { borderColor: "red" }
                                            : { borderColor: Colors.grey },
                                    ]}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        onChange(text);
                                    }}
                                    value={value}
                                />
                            )}
                            name="nickname"
                        />

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Model</Text>
                            <Text style={Theme.Caption}>
                                What's the model of your vehicle?
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            rules={{
                                required: "Model is required",
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"Model"}
                                    style={[
                                        Theme.InputStyle,
                                        {
                                            backgroundColor: "#FFF",
                                            borderWidth: 1,
                                        },
                                        errors.model
                                            ? { borderColor: "red" }
                                            : { borderColor: Colors.grey },
                                    ]}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        const formattedText = text.replace(
                                            /\\n/g,
                                            "\n"
                                        );
                                        onChange(text);
                                        clearErrors("model");
                                    }}
                                    value={value}
                                />
                            )}
                            name="model"
                        />
                        {errors.model && (
                            <Text style={[Theme.Caption, { color: "red" }]}>
                                Model is required
                            </Text>
                        )}

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Description</Text>
                            <Text style={Theme.Caption}>
                                Tell us a little bit about your vehicle
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"Let's hear it..."}
                                    multiline
                                    style={[
                                        Theme.InputStyle,
                                        {
                                            minHeight: 100,
                                            paddingTop: 10,
                                            lineHeight: 20,
                                            backgroundColor: "#FFF",
                                            borderWidth: 1,
                                        },
                                        errors.description
                                            ? { borderColor: "red" }
                                            : { borderColor: Colors.grey },
                                    ]}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        const formattedText = text.replace(
                                            /\\n/g,
                                            "\n"
                                        );
                                        onChange(text);
                                        clearErrors("description");
                                    }}
                                    value={value}
                                />
                            )}
                            name="description"
                        />

                        <View style={{ paddingTop: 15, gap: 15 }}>
                            {error && (
                                <Text style={[Theme.Caption, { color: "red" }]}>
                                    {/* {error} */}
                                </Text>
                            )}

                            <TouchableOpacity
                                onPress={handleSubmit(onSubmit)}
                                style={{
                                    width: "100%",
                                    backgroundColor: Colors.primary,
                                    height: 50,
                                    borderRadius: 10,
                                    marginTop: 15,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 100,
                                }}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={Colors.light} />
                                ) : (
                                    <Text
                                        style={{
                                            fontFamily: "font-b",
                                            fontSize: 16,
                                            color: Colors.light,
                                            textAlign: "center",
                                            lineHeight: 50,
                                        }}
                                    >
                                        {"Add vehicle"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAwareScrollView>
        </>
    );
};

export default NewVehicle;
