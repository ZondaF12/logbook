import {
    View,
    Text,
    useWindowDimensions,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
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
import { Image } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { LogbookTypes } from "../[id]";
import { categories } from "@/types/catgeories";

const imgDir = FileSystem.documentDirectory + "images/";
const fileDir = FileSystem.documentDirectory + "files/";

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
    }
};

const AddLogbook = () => {
    const { id, logId } = useLocalSearchParams<{
        id: string;
        logId: string;
    }>();

    const { session } = useAuth();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [images, setImages] = useState<
        { localImage: string; serverImage?: string }[]
    >([]);

    const [files, setFiles] = useState<
        { localFile: any; serverFile?: string }[]
    >([]);

    const uploadImage = async (uri: string) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
        });
        const filePath = `${
            session?.user?.id
        }/${id}/images/${new Date().getTime()}.jpeg`;

        try {
            const { data, error } = await supabase.storage
                .from("vehiclelogbooks")
                .upload(filePath, decode(base64), {
                    contentType: "image/jpeg",
                });

            if (data) {
                const { data: url, error } = await supabase.storage
                    .from("vehiclelogbooks")
                    .createSignedUrl(filePath, 600000000000);

                return url?.signedUrl;
            }
        } catch (error) {
            console.warn(error);
        }
    };

    const uploadFile = async (uri: string, name: string) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
        });

        const filePath = `${session?.user?.id}/${id}/files/${name}`;

        try {
            const { data, error } = await supabase.storage
                .from("vehiclelogbooks")
                .upload(filePath, decode(base64));

            if (data) {
                const { data: url, error } = await supabase.storage
                    .from("vehiclelogbooks")
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

    const saveFile = async (uri: string, name: string) => {
        const dest = fileDir + name;
        await FileSystem.copyAsync({ from: uri, to: dest });
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

    const selectFiles = async (useLibrary: boolean) => {
        const result = await DocumentPicker.getDocumentAsync({
            multiple: true,
        });

        if (!result) {
            return;
        }

        if (!result?.canceled) {
            setIsUploading(true);

            const savedFiles = result.assets;

            setFiles((prevFiles: any) => [
                ...prevFiles,
                ...savedFiles.map((file) => ({ localFile: file })),
            ]);

            const uploadedFiles = await Promise.all(
                savedFiles.map(async (savedFile: any) => {
                    return await uploadFile(savedFile.uri, savedFile.name);
                })
            );

            const file_urls: string[] = [];
            for (const item of uploadedFiles) {
                file_urls.push(item!);
            }

            const updatedFiles = savedFiles.map((savedFile, index) => ({
                localFile: savedFile,
                serverFile: file_urls[index],
            }));
            setFiles((prevFiles: any) => [
                ...prevFiles.filter((image: any) => image.serverFile != null),
                ...updatedFiles,
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
        watch,
    } = useForm<any>({
        defaultValues: {
            title: undefined,
            description: undefined,
            date: undefined,
            categoryId: undefined,
            files: [],
            cost: undefined,
            notes: undefined,
            images: [],
        },
    });

    const selectedCategory = watch("categoryId");

    useEffect(() => {
        setValue(
            "files",
            files.map((file) => file.serverFile || "")
        );
    }, [files]);

    useEffect(() => {
        setValue(
            "images",
            images.map((image) => image.serverImage || "")
        );
    }, [images]);

    const dimensions = useWindowDimensions();

    const onSubmit: SubmitHandler<any> = async (values) => {
        const newLog = {
            user_id: session?.user?.id,
            vehicle_id: id,
            title: values.title,
            description: values.description,
            date: values.date,
            category: values.categoryId,
            cost: values.cost,
            notes: values.notes,
            images: values.images,
            files: values.files,
        };

        const { error } = await supabase.from("vehicle_logs").insert(newLog);

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
                        {LogbookTypes[+logId - 1].name}
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
                        New Log
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
                        <Text style={[Theme.Title, { marginTop: 5 }]}>
                            Category
                        </Text>
                        {categories && (
                            <Controller
                                control={control}
                                name="categoryId"
                                rules={{
                                    required: "Category is required",
                                }}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <View
                                        style={{
                                            display: "flex",
                                            gap: 10,
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {categories.map((category, key) => (
                                            <TouchableOpacity
                                                key={key}
                                                onPress={() =>
                                                    onChange(category.id)
                                                }
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    backgroundColor:
                                                        selectedCategory ===
                                                        category.id
                                                            ? Colors.dark
                                                            : Colors.light,
                                                    borderRadius: 99,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 10,
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        Theme.Caption,
                                                        {
                                                            color:
                                                                selectedCategory ===
                                                                category.id
                                                                    ? Colors.light
                                                                    : Colors.dark,
                                                        },
                                                    ]}
                                                    key={category.id}
                                                >
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            />
                        )}
                        {errors.categoryId && (
                            <Text style={[Theme.Caption, { color: "red" }]}>
                                Please select a category
                            </Text>
                        )}

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Title</Text>
                            <Text style={Theme.Caption}>
                                Give your log a title
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            rules={{
                                required: "Title is required",
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"Log Title..."}
                                    style={[
                                        Theme.InputStyle,
                                        {
                                            backgroundColor: "#FFF",
                                            borderWidth: 1,
                                        },
                                        errors.title
                                            ? { borderColor: "red" }
                                            : { borderColor: Colors.grey },
                                    ]}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        onChange(text);
                                    }}
                                    value={value}
                                    placeholderTextColor={Colors.grey}
                                />
                            )}
                            name="title"
                        />
                        {errors.title && (
                            <Text style={[Theme.Caption, { color: "red" }]}>
                                Title is required
                            </Text>
                        )}

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Date</Text>
                            <Text style={Theme.Caption}>
                                What date did this log occur?
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            rules={{
                                required: "Date is required",
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"Date..."}
                                    style={[
                                        Theme.InputStyle,
                                        {
                                            backgroundColor: "#FFF",
                                            borderWidth: 1,
                                        },
                                        errors.date
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
                                        clearErrors("date");
                                    }}
                                    value={value}
                                    placeholderTextColor={Colors.grey}
                                />
                            )}
                            name="date"
                        />
                        {errors.date && (
                            <Text style={[Theme.Caption, { color: "red" }]}>
                                Date is required
                            </Text>
                        )}

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Description</Text>
                            <Text style={Theme.Caption}>
                                Give us a short description of the log
                                (optional)
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
                                    placeholderTextColor={Colors.grey}
                                />
                            )}
                            name="description"
                        />

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Notes</Text>
                            <Text style={Theme.Caption}>
                                Add some notes to this log (optional)
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"Note..."}
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
                                        errors.notes
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
                                        clearErrors("notes");
                                    }}
                                    value={value}
                                    placeholderTextColor={Colors.grey}
                                />
                            )}
                            name="notes"
                        />

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Cost</Text>
                            <Text style={Theme.Caption}>
                                Add any costs associated with this log
                                (optional)
                            </Text>
                        </View>
                        <Controller
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <TextInput
                                    placeholder={"£0.00"}
                                    style={[
                                        Theme.InputStyle,
                                        {
                                            backgroundColor: "#FFF",
                                            borderWidth: 1,
                                        },
                                        errors.cost
                                            ? { borderColor: "red" }
                                            : { borderColor: Colors.grey },
                                    ]}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        onChange(text);
                                    }}
                                    value={value}
                                    placeholderTextColor={Colors.grey}
                                />
                            )}
                            name="cost"
                        />

                        <View style={{ gap: 10, marginTop: 5 }}>
                            <Text style={Theme.Title}>Files</Text>
                            <Text style={Theme.Caption}>
                                Add any files related to this log (optional)
                            </Text>
                        </View>
                        <Controller
                            name="files"
                            control={control}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <ScrollView
                                    style={{ height: 150 }}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <TouchableOpacity
                                        onPress={() => selectFiles(true)}
                                        style={{
                                            width:
                                                files && files?.length > 0
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
                                            name="file-tray-full"
                                            size={24}
                                            color={Colors.grey}
                                        />
                                    </TouchableOpacity>

                                    {files &&
                                        files.map((file, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    marginRight: 10,
                                                    position: "relative",
                                                    alignItems: "center", // Center horizontally
                                                    justifyContent: "center", // Center vertically
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 150,
                                                        flex: 1,
                                                        borderRadius: 10,
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        backgroundColor:
                                                            Colors.light,
                                                    }}
                                                >
                                                    <Text style={Theme.Caption}>
                                                        {file.localFile.name}
                                                    </Text>
                                                </View>

                                                {!file.serverFile && (
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
                                                        setFiles((prevFiles) =>
                                                            prevFiles.filter(
                                                                (_, i) =>
                                                                    i !== index
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

                        <View style={{ paddingTop: 15, gap: 15 }}>
                            {error && (
                                <Text style={[Theme.Caption, { color: "red" }]}>
                                    {error}
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
                                        Add Log
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

export default AddLogbook;
